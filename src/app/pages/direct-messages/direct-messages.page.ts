import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, OnDestroy, OnInit, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { distinctUntilChanged, firstValueFrom, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../dialogs/confirmation-dialog/confirmation.dialog';
import { StatusesService } from '../../services/http/statuses.service';
import { UsersService } from '../../services/http/users.service';
import { AccountService } from '../../services/http/account.service';
import type { GalleryRef } from 'ng-gallery';
import type { Lightbox } from 'ng-gallery/lightbox';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AvatarComponent } from '../../components/widgets/avatar/avatar.component';
import { AvatarSize } from '../../components/widgets/avatar/avatar-size';
import { UserSelectorComponent } from '../../components/widgets/user-selector/user-selector.component';
import { ViewportObserverDirective } from '../../directives/viewport-observer.directive';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';
import { DirectConversation } from '../../models/direct-conversation';
import { DirectMessage } from '../../models/direct-message';
import { TemporaryAttachment } from '../../models/temporary-attachment';
import { User } from '../../models/user';
import { AuthorizationService } from '../../services/authorization/authorization.service';
import { MessagesService } from '../../services/common/messages.service';
import { UserDisplayService } from '../../services/common/user-display.service';
import { AttachmentsService } from '../../services/http/attachments.service';
import { DirectMessagesService } from '../../services/http/direct-messages.service';
import { InstanceService } from '../../services/http/instance.service';
@Component({
    selector: 'app-direct-messages',
    templateUrl: './direct-messages.page.html',
    styleUrls: ['./direct-messages-sidebar.scss', './direct-messages.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }],
    imports: [FormsModule, CdkTextareaAutosize, LocalizedDatePipe, TranslatePipe, MatButton, MatIconButton, MatIcon, MatMenu, MatMenuItem,
        MatMenuTrigger, MatProgressSpinner, AvatarComponent, UserSelectorComponent, ViewportObserverDirective, InputActivityDirective, RouterLink]
})
export class DirectMessagesPage implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize;

    protected readonly maxCharacters: number;
    protected readonly maxAttachments: number;
    protected readonly acceptedTypes: string;

    protected readonly currentUser = inject(AuthorizationService).getUser();
    protected readonly display = inject(UserDisplayService);

    protected readonly conversations = signal<DirectConversation[]>([]);
    protected readonly messages = signal<DirectMessage[]>([]);
    protected readonly recipients = signal<User[]>([]);
    protected readonly attachments = signal<TemporaryAttachment[]>([]);
    protected readonly selected = signal<DirectConversation | undefined>(undefined);
    protected readonly candidate = signal<User | undefined>(undefined);

    protected readonly query = signal('');
    protected readonly note = signal('');

    protected readonly emailHasBeenVerified = signal<boolean | undefined>(undefined);
    protected readonly creating = signal(false);
    protected readonly panelOpen = signal(false);
    protected readonly loadingList = signal(false);
    protected readonly loadingMessages = signal(false);
    protected readonly sending = signal(false);
    protected readonly uploading = signal(false);
    protected readonly muting = signal(false);
    protected readonly removing = signal(false);
    protected readonly listError = signal(false);
    protected readonly messagesError = signal(false);
    protected readonly moreConversations = signal(false);
    protected readonly moreMessages = signal(false);

    protected readonly messageActionsPending = signal(new Set<string>());

    protected readonly busy = computed(() => this.sending() || this.uploading() || this.removing());

    protected readonly filteredConversations = computed(() => {
        const query = this.query().trim().toLocaleLowerCase();

        return this.conversations().filter(conversation => !query || [
            conversation.summary,
            ...conversation.participants.flatMap(user => [user.name, user.userName, user.account])
        ].some(value => value?.toLocaleLowerCase().includes(query)));
    });

    protected readonly canAdd = computed(() => {
        const user = this.candidate();

        return !!user?.id && user.id !== this.currentUser?.id && this.recipients().length < 100
            && !this.recipients().some(recipient => recipient.id === user.id) && !this.busy();
    });

    protected readonly canSend = computed(() => this.emailHasBeenVerified() === true
        && !this.busy()
        && !this.loadingMessages()
        && !this.messagesError()
        && (this.creating() || !!this.selected())
        && this.recipients().length > 0
        && (!!this.note().trim() || this.attachments().length > 0)
        && this.note().length <= this.maxCharacters);

    private readonly galleryId = 'directMessagesGallery';
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly maxFileSize: number;

    private readonly history = viewChild<ElementRef<HTMLElement>>('history');

    private listPage = 0;
    private messagePage = 0;
    private routeSelectionVersion = 0;

    // Ignore asynchronous responses from a conversation that is no longer open.
    private generation = 0;
    private destroyed = false;

    private galleryRef?: GalleryRef;
    private lightbox?: Lightbox;
    private readTimer?: ReturnType<typeof setTimeout>;
    private routeParamsSubscription?: Subscription;
    private pendingRouteParams?: ParamMap;

    private pendingReads = new Set<string>();
    private reading = new Set<string>();

    private readonly api = inject(DirectMessagesService);
    private readonly statusesApi = inject(StatusesService);
    private readonly usersApi = inject(UsersService);
    private readonly accountApi = inject(AccountService);
    private readonly uploads = inject(AttachmentsService);
    private readonly feedback = inject(MessagesService);
    private readonly translate = inject(TranslateService);
    private readonly route = inject(ActivatedRoute);
    private readonly dialog = inject(MatDialog);
    private readonly injector = inject(Injector);
    private readonly instance = inject(InstanceService).instance;

    constructor() {
        this.maxCharacters = this.instance?.configuration?.statuses?.maxCharacters ?? 500;
        this.maxAttachments = this.instance?.configuration?.statuses?.maxMediaAttachments ?? 4;
        this.acceptedTypes = this.instance?.configuration?.attachments?.supportedMimeTypes?.join(',') || 'image/jpeg,image/png,image/webp,image/heic,image/heif';
        this.maxFileSize = this.instance?.configuration?.attachments?.imageSizeLimit ?? 10485760;
    }

    async ngOnInit(): Promise<void> {
        await Promise.all([this.loadConversations(true), this.loadEmailVerification()]);

        if (this.destroyed) {
            return;
        }

        let initialSelection: Promise<void> | undefined;

        this.routeParamsSubscription = this.route.queryParamMap.pipe(
            distinctUntilChanged((previous, current) => previous.get('conversationId') === current.get('conversationId')
                && previous.get('recipientId') === current.get('recipientId'))
        ).subscribe(params => {
            this.routeSelectionVersion++;
            this.pendingRouteParams = params;

            const selection = this.applyPendingRouteSelection();

            initialSelection ??= selection;
        });

        await initialSelection;
    }

    ngOnDestroy(): void {
        this.destroyed = true;
        this.generation++;
        this.routeParamsSubscription?.unsubscribe();
        clearTimeout(this.readTimer);
        this.lightbox?.close();
        this.galleryRef?.destroy();

        if (!this.sending()) {
            this.discardAttachments();
        }
    }

    protected others(conversation: DirectConversation): User[] {
        return conversation.participants.filter(user => user.id !== this.currentUser?.id);
    }

    protected title(conversation: DirectConversation): string {
        const others = this.others(conversation);

        return this.display.displayName(others[0]) + (others.length > 1 ? ` +${others.length - 1}` : '');
    }

    protected profileLink(user: User): string {
        const account = user.isLocal === false ? user.account ?? user.userName : user.userName ?? user.account;

        return '/@' + account;
    }

    protected async openImages(message: DirectMessage, index: number): Promise<void> {
        if (message.deletedAt || !message.status) {
            return;
        }

        const [{ Gallery, ImageItem }, { Lightbox }] = await Promise.all([import('ng-gallery'), import('ng-gallery/lightbox')]);

        if (this.destroyed) {
            return;
        }

        const images = message.status?.attachments?.map(attachment => new ImageItem({
            src: attachment.originalFile?.url || attachment.smallFile?.url,
            thumb: attachment.smallFile?.url || attachment.originalFile?.url,
            alt: attachment.description
        })) ?? [];

        if (!images.length) {
            return;
        }

        this.galleryRef = this.injector.get(Gallery).ref(this.galleryId);
        this.galleryRef.load(images);
        this.lightbox = this.injector.get(Lightbox);
        this.lightbox.open(index, this.galleryId, { panelClass: 'fullscreen' });
    }

    protected async loadConversations(reset = false): Promise<void> {
        if (this.loadingList()) {
            return;
        }

        this.loadingList.set(true);
        this.listError.set(false);

        try {
            const page = reset ? 1 : this.listPage + 1;
            const result = await this.api.list(page);

            if (this.destroyed) {
                return;
            }

            const previous = reset ? [] : this.conversations();
            const incomingIds = new Set(result.data.map(item => item.id));

            this.conversations.set([...previous.filter(item => !incomingIds.has(item.id)), ...result.data]);
            this.listPage = page;
            this.moreConversations.set(page * result.size < result.total);
        } catch (error) {
            this.listError.set(true);
            this.feedback.showServerError(error);
        } finally {
            this.loadingList.set(false);
        }
    }

    protected newMessage(): void {
        if (this.busy()) {
            return;
        }

        this.resetPanel();
        this.creating.set(true);
        this.panelOpen.set(true);
    }

    protected async openConversation(conversation: DirectConversation): Promise<void> {
        if (this.busy()) {
            return;
        }

        this.resetPanel();
        this.creating.set(false);
        this.selected.set(conversation);
        this.recipients.set(this.others(conversation));
        this.panelOpen.set(true);
        await this.loadMessages(true);
    }

    protected back(): void {
        if (this.busy()) {
            return;
        }

        this.panelOpen.set(false);
    }

    protected addRecipient(): void {
        const user = this.candidate();

        if (!this.canAdd() || !user) {
            return;
        }

        this.recipients.update(users => [...users, user]);
        this.candidate.set(undefined);
    }

    protected removeRecipient(user: User): void {
        if (!this.creating() || this.busy()) {
            return;
        }

        this.recipients.update(users => users.filter(item => item.id !== user.id));
    }

    protected async loadMessages(reset = false): Promise<void> {
        const conversation = this.selected();

        if (!conversation || this.loadingMessages()) {
            return;
        }

        const generation = this.generation;
        const element = this.history()?.nativeElement;
        const oldHeight = element?.scrollHeight ?? 0;
        const oldTop = element?.scrollTop ?? 0;

        this.loadingMessages.set(true);
        this.messagesError.set(false);

        try {
            const page = reset ? 1 : this.messagePage + 1;
            const result = await this.api.messages(conversation.id, page);

            if (generation !== this.generation) {
                return;
            }

            const previous = reset ? [] : this.messages();
            const ids = new Set(previous.map(message => message.id));
            const incoming = result.data.filter(message => !ids.has(message.id)).reverse();

            this.messages.set(reset ? incoming : [...incoming, ...previous]);
            this.messagePage = page;
            this.moreMessages.set(page * result.size < result.total);
            this.scrollHistory(reset, oldHeight, oldTop);
        } catch (error) {
            if (generation === this.generation) {
                this.messagesError.set(true);
                this.feedback.showServerError(error);
            }
        } finally {
            if (generation === this.generation) {
                this.loadingMessages.set(false);
            }
        }
    }

    protected async upload(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);

        input.value = '';

        if (this.busy() || this.emailHasBeenVerified() !== true) {
            return;
        }

        this.uploading.set(true);

        try {
            for (const file of files) {
                if (this.attachments().length >= this.maxAttachments) {
                    break;
                }

                if (!file.type.startsWith('image/') || !this.acceptedTypes.split(',').includes(file.type) || file.size > this.maxFileSize) {
                    this.feedback.showError(this.translate.instant('pages.directMessages.invalidImage'));
                    continue;
                }

                const data = new FormData();

                data.append('file', file);

                const attachment = await this.uploads.uploadAttachment(data);

                if (this.destroyed) {
                    await this.uploads.deleteAttachment(attachment.id);
                    break;
                }

                this.attachments.update(items => [...items, attachment]);
            }
        } catch (error) {
            this.feedback.showServerError(error);
        } finally {
            this.uploading.set(false);
            void this.applyPendingRouteSelection();
        }
    }

    protected async removeAttachment(attachment: TemporaryAttachment): Promise<void> {
        if (this.busy()) {
            return;
        }

        this.removing.set(true);

        try {
            await this.uploads.deleteAttachment(attachment.id);
            this.attachments.update(items => items.filter(item => item.id !== attachment.id));
        } catch (error) {
            this.feedback.showServerError(error);
        } finally {
            this.removing.set(false);
            void this.applyPendingRouteSelection();
        }
    }

    protected async send(): Promise<void> {
        if (!this.canSend()) {
            return;
        }

        this.sending.set(true);

        try {
            const message = await this.api.send({
                recipientIds: this.recipients().map(user => user.id!),
                note: this.note().trim(),
                attachmentIds: this.attachments().map(attachment => attachment.id)
            }, this.selected()?.id);

            // The upload belongs to the sent status now, even if the inbox refresh fails.
            this.attachments.set([]);
            this.note.set('');

            if (this.destroyed) {
                return;
            }

            this.creating.set(false);
            this.messages.update(messages => [...messages, message]);

            const conversation: DirectConversation = {
                id: message.conversationId,
                participants: [message.author ?? message.status?.user ?? this.currentUser, ...message.recipients].filter(Boolean) as User[],
                summary: message.status?.note,
                lastStatusId: message.id,
                lastActivityAt: message.publishedAt ?? message.status?.publishedAt ?? message.status?.createdAt ?? new Date().toISOString(),
                lastMessageDeletedAt: message.deletedAt,
                hasUnreadMessages: false,
                isMuted: this.selected()?.isMuted ?? false
            };

            this.selected.set(conversation);
            this.conversations.update(items => [conversation, ...items.filter(item => item.id !== conversation.id)]);
            this.scrollHistory(true);
        } catch (error) {
            if (this.destroyed) {
                this.discardAttachments();
            }

            this.feedback.showServerError(error);
        } finally {
            this.sending.set(false);
            void this.applyPendingRouteSelection();
        }
    }

    protected onVisible(message: DirectMessage, visible: boolean): void {
        if (!this.isBrowser || !visible || message.deletedAt || !message.status || message.readAt || this.messageAuthor(message)?.id === this.currentUser?.id
            || message.conversationId !== this.selected()?.id || this.reading.has(message.id)) {
            return;
        }

        this.pendingReads.add(message.id);
        clearTimeout(this.readTimer);
        this.readTimer = setTimeout(() => void this.markVisibleRead(), 150);
    }

    protected messageAuthor(message: DirectMessage): User | undefined {
        return message.author ?? message.status?.user;
    }

    protected async toggleLike(message: DirectMessage): Promise<void> {
        if (message.deletedAt || !message.status || this.messageAuthor(message)?.id === this.currentUser?.id
            || this.messageActionsPending().has(message.id)) {
            return;
        }

        const generation = this.generation;

        this.setMessageActionPending(message.id, true);

        try {
            const status = message.status.favourited
                ? await this.statusesApi.unfavourite(message.id) : await this.statusesApi.favourite(message.id);

            if (this.destroyed || generation !== this.generation) {
                return;
            }

            this.messages.update(items => items.map(item => item.id === message.id && !item.deletedAt ? { ...item, status } : item));
        } catch (error) {
            if (!this.destroyed) {
                this.feedback.showServerError(error);
            }
        } finally {
            this.setMessageActionPending(message.id, false);
        }
    }

    protected async deleteMessage(message: DirectMessage): Promise<void> {
        if (message.deletedAt || !message.status || this.messageAuthor(message)?.id !== this.currentUser?.id
            || this.messageActionsPending().has(message.id)) {
            return;
        }

        const generation = this.generation;
        const conversationId = message.conversationId;

        this.setMessageActionPending(message.id, true);

        try {
            const confirmation = this.dialog.open(ConfirmationDialog, {
                width: '500px',
                data: this.translate.instant('pages.directMessages.confirmDelete')
            });
            const result = await firstValueFrom(confirmation.afterClosed());

            if (!result?.confirmed || this.destroyed || generation !== this.generation) {
                return;
            }

            await this.statusesApi.delete(message.id);

            if (this.destroyed || generation !== this.generation) {
                return;
            }

            const deletedAt = new Date().toISOString();

            // Preserve the history entry even if the following refresh fails.
            this.messages.update(items => items.map(item => item.id === message.id ? {
                ...item,
                author: this.messageAuthor(item),
                publishedAt: item.publishedAt ?? item.status?.publishedAt ?? item.status?.createdAt,
                replyToStatusId: item.replyToStatusId ?? item.status?.replyToStatusId,
                status: undefined,
                readAt: undefined,
                deletedAt
            } : item));

            const updatePreview = (conversation: DirectConversation): DirectConversation => conversation.lastStatusId === message.id
                ? { ...conversation, summary: undefined, lastMessageDeletedAt: deletedAt } : conversation;

            this.selected.update(conversation => conversation ? updatePreview(conversation) : conversation);
            this.conversations.update(items => items.map(updatePreview));

            const pageCount = Math.max(1, this.messagePage);
            const [history, conversation] = await Promise.all([
                Promise.all(Array.from({ length: pageCount }, (_, index) => this.api.messages(conversationId, index + 1))),
                this.api.conversation(conversationId)
            ]);

            if (this.destroyed || generation !== this.generation) {
                return;
            }

            this.messages.set(history.flatMap(page => page.data).reverse());
            this.messagePage = pageCount;

            const lastPage = history[history.length - 1];

            this.moreMessages.set(this.messagePage * lastPage.size < lastPage.total);
            this.selected.set(conversation);
            this.conversations.update(items => items.map(item => item.id === conversationId ? conversation : item));
        } catch (error) {
            if (!this.destroyed) {
                this.feedback.showServerError(error);
            }
        } finally {
            this.setMessageActionPending(message.id, false);
        }
    }

    protected async toggleMute(): Promise<void> {
        const conversation = this.selected();

        if (!conversation || this.muting()) {
            return;
        }

        this.muting.set(true);

        try {
            await this.api.mute(conversation.id, !conversation.isMuted);

            const isMuted = !conversation.isMuted;

            this.selected.update(current => current?.id === conversation.id ? { ...current, isMuted } : current);
            this.conversations.update(items => items.map(item => item.id === conversation.id ? { ...item, isMuted } : item));
        } catch (error) {
            this.feedback.showServerError(error);
        } finally {
            this.muting.set(false);
        }
    }

    private async applyPendingRouteSelection(): Promise<void> {
        if (this.destroyed || this.busy() || !this.pendingRouteParams) {
            return;
        }

        const params = this.pendingRouteParams;
        const version = this.routeSelectionVersion;

        this.pendingRouteParams = undefined;

        await this.openRouteSelection(params, version);
    }

    private async openRouteSelection(params: ParamMap, version: number): Promise<void> {
        // Profile links start a draft; notification links open an existing conversation.
        const conversationId = params.get('conversationId');
        const recipientId = params.get('recipientId');

        if (recipientId) {
            this.newMessage();

            const generation = this.generation;

            try {
                const user = await this.usersApi.profile(recipientId);

                if (this.destroyed || version !== this.routeSelectionVersion || generation !== this.generation) {
                    return;
                }

                if (user.id && user.id !== this.currentUser?.id) {
                    this.recipients.set([user]);
                }
            } catch (error) {
                if (!this.destroyed && version === this.routeSelectionVersion && generation === this.generation) {
                    this.feedback.showServerError(error);
                }
            }
        } else if (conversationId) {
            if (this.selected()?.id === conversationId && !this.creating()) {
                this.panelOpen.set(true);
                return;
            }

            const generation = this.generation;

            try {
                const conversation = this.conversations().find(item => item.id === conversationId)
                    ?? await this.api.conversation(conversationId);

                if (this.destroyed || version !== this.routeSelectionVersion || generation !== this.generation) {
                    return;
                }

                if (!this.conversations().some(item => item.id === conversation.id)) {
                    this.conversations.update(items => [conversation, ...items]);
                }

                await this.openConversation(conversation);
            } catch (error) {
                if (!this.destroyed && version === this.routeSelectionVersion) {
                    this.feedback.showServerError(error);
                }
            }
        } else if (!this.panelOpen() && this.conversations()[0]) {
            await this.openConversation(this.conversations()[0]);
        }
    }

    private async loadEmailVerification(): Promise<void> {
        try {
            const result = await this.accountApi.getEmailVerified();

            if (!this.destroyed) {
                this.emailHasBeenVerified.set(result.result === true);
            }
        } catch (error) {
            if (!this.destroyed) {
                this.feedback.showServerError(error);
            }
        }
    }

    private setMessageActionPending(id: string, pending: boolean): void {
        this.messageActionsPending.update(current => {
            const next = new Set(current);

            if (pending) {
                next.add(id);
            } else {
                next.delete(id);
            }

            return next;
        });
    }

    private async markVisibleRead(): Promise<void> {
        const conversation = this.selected();
        const generation = this.generation;
        const ids = [...this.pendingReads];

        this.pendingReads.clear();

        if (!conversation || !ids.length) {
            return;
        }

        ids.forEach(id => this.reading.add(id));

        try {
            for (let offset = 0; offset < ids.length; offset += 100) {
                await this.api.markRead(conversation.id, ids.slice(offset, offset + 100));
            }

            if (generation !== this.generation) {
                return;
            }

            const readAt = new Date().toISOString();

            this.messages.update(messages => messages.map(message => ids.includes(message.id) ? { ...message, readAt } : message));

            // Reading the latest message does not imply that older, undisplayed messages are read.
            const updated = await this.api.conversation(conversation.id);

            if (generation !== this.generation) {
                return;
            }

            this.selected.set(updated);
            this.conversations.update(items => items.map(item => item.id === updated.id ? updated : item));
        } catch (error) {
            if (!this.destroyed) {
                this.feedback.showServerError(error);
            }
        } finally {
            ids.forEach(id => this.reading.delete(id));
        }
    }

    private resetPanel(): void {
        this.generation++;
        clearTimeout(this.readTimer);
        this.pendingReads.clear();
        this.discardAttachments();
        this.selected.set(undefined);
        this.messages.set([]);
        this.recipients.set([]);
        this.candidate.set(undefined);
        this.note.set('');
        this.loadingMessages.set(false);
        this.messagesError.set(false);
        this.moreMessages.set(false);
        this.messagePage = 0;
    }

    private discardAttachments(): void {
        const attachments = this.attachments();

        this.attachments.set([]);

        for (const attachment of attachments) {
            void this.uploads.deleteAttachment(attachment.id).catch(error => {
                if (!this.destroyed) {
                    this.feedback.showServerError(error);
                }
            });
        }
    }

    private scrollHistory(bottom: boolean, oldHeight = 0, oldTop = 0): void {
        if (!this.isBrowser) {
            return;
        }

        const generation = this.generation;

        setTimeout(() => {
            const element = this.history()?.nativeElement;

            if (!element || generation !== this.generation) {
                return;
            }

            element.scrollTop = bottom ? element.scrollHeight : oldTop + element.scrollHeight - oldHeight;
        });
    }
}
