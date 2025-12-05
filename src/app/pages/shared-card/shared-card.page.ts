import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { combineLatest, map, Subscription } from 'rxjs';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { ProfileCodeDialog } from 'src/app/dialogs/profile-code-dialog/profile-code.dialog';
import { UpdateSharedBusinessCardDialog } from 'src/app/dialogs/update-shared-business-card/update-shared-business-card.dialog';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { SharedBusinessCardMessage } from 'src/app/models/shared-business-card-message';
import { User } from 'src/app/models/user';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { SharedBusinessCardsService } from 'src/app/services/http/shared-business-cards.service';

@Component({
    selector: 'app-shared-card',
    templateUrl: './shared-card.page.html',
    styleUrls: ['./shared-card.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SharedCardPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected avatarSize = AvatarSize;
    protected isReady = signal(false);

    protected message = model('');
    protected cardClientUser = signal<User | undefined>(undefined);

    protected cardTitle = signal('');
    protected cardNote = signal('');
    protected cardCreatedDate = signal(new Date());
    protected cardClientName = signal('');
    protected cardClientEmail = signal('');
    protected cardMessages = signal<SharedBusinessCardMessage[]>([]);

    private sharedBusinessCard?: SharedBusinessCard;
    private sharedBusinessCardId = '';
    private routeParamsSubscription?: Subscription;

    private sharedBusinessCardsService = inject(SharedBusinessCardsService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);
    private messageService = inject(MessagesService);
    private dialog = inject(MatDialog);
    private windowService = inject(WindowService)
    private router = inject(Router);

    protected isAuthor(message: SharedBusinessCardMessage): boolean {
        return message.addedByUser;
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParamMap])
            .pipe(map(params => ({ routeParams: params[0], queryParams: params[1] })))
            .subscribe(async params => {
                this.isReady.set(false);
                this.loadingService.showLoader();
    
                const internalSharedBusinessCardId = params.routeParams['id'] as string;
                if (internalSharedBusinessCardId) {
                    this.sharedBusinessCard = await this.sharedBusinessCardsService.read(internalSharedBusinessCardId);
                    this.sharedBusinessCardId = internalSharedBusinessCardId;
    
                    if (this.sharedBusinessCard) {
                        this.cardTitle.set(this.sharedBusinessCard.title);
                        this.cardNote.set(this.sharedBusinessCard.note ?? '');
                        this.cardClientName.set(this.sharedBusinessCard.thirdPartyName ?? '');
                        this.cardClientEmail.set(this.sharedBusinessCard.thirdPartyEmail ?? '');
                        this.refreshUserPersonalInfo();
    
                        this.cardMessages.set(this.sharedBusinessCard.messages ?? []);
                    }

                    if (params.queryParams.has('qr')) {
                        await this.openQrCodeDialog();
                    }
                }
        
                this.isReady.set(true);
                this.loadingService.hideLoader();
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    protected async sendMessage(): Promise<void> {
        if (!this.message() || this.message().length === 0 || !this.sharedBusinessCardId) {
            return;
        }

        try {
            const sharedBusinessCardMessage = new SharedBusinessCardMessage(this.message(), true);
            await this.sharedBusinessCardsService.message(this.sharedBusinessCardId, sharedBusinessCardMessage);

            this.cardMessages.update((messages) => {
                return [...messages, new SharedBusinessCardMessage(this.message(), true)];
            });
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }

        this.message.set('');
    }

    protected async openQrCodeDialog(): Promise<void> {
        this.dialog.open(ProfileCodeDialog, {
            data: this.windowService.getApplicationBaseUrl() + '/cards/' + this.sharedBusinessCard?.code + '?update=true',
        });

        const navigationExtras: NavigationExtras = {
            queryParams: { },
            queryParamsHandling: 'replace'
        };

        await this.router.navigate([], navigationExtras);
    }

    protected async openUpdateSharedBusinessCardDialog(): Promise<void> {
        const dialogRef = this.dialog.open(UpdateSharedBusinessCardDialog, {
            width: '500px',
            data: this.sharedBusinessCard
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    await this.sharedBusinessCardsService.updateByThirdParty(this.sharedBusinessCard?.code ?? '', result);

                    this.cardClientName.set(result.thirdPartyName ?? '');
                    this.cardClientEmail.set(result.thirdPartyEmail ?? '');
                    this.refreshUserPersonalInfo();

                    const navigationExtras: NavigationExtras = {
                        queryParams: { },
                        queryParamsHandling: 'replace'
                    };

                    await this.router.navigate([], navigationExtras);

                    this.messageService.showSuccess('Your personal data has been saved.');
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    private refreshUserPersonalInfo(): void {
        const internalClientUser = new User();
        internalClientUser.name = this.cardClientName();
        internalClientUser.userName = this.cardClientEmail();
        internalClientUser.avatarUrl = 'assets/user.svg';
        this.cardClientUser.set(internalClientUser);
    }
}
