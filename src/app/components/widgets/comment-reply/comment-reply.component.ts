import { ChangeDetectionStrategy, Component, computed, effect, input, model, OnInit, output, signal, viewChild } from '@angular/core';
import { Status } from 'src/app/models/status';
import { StatusRequest } from 'src/app/models/status-request';
import { User } from 'src/app/models/user';
import { MessagesService } from 'src/app/services/common/messages.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { AvatarSize } from '../avatar/avatar-size';
import { NgForm } from '@angular/forms';
import { InstanceService } from 'src/app/services/http/instance.service';

@Component({
    selector: 'app-comment-reply',
    templateUrl: './comment-reply.component.html',
    styleUrls: ['./comment-reply.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CommentReplyComponent implements OnInit {
    public signedInUser = input.required<User>();
    public status = input.required<Status>();
    public showCancel = input(false);
    public clickCancel = output();
    public added = output();

    protected maxStatusLength = signal(0);
    protected comment = model<string | undefined>('');
    protected isDuringSave = signal(false);
    protected commentEntered = computed(() => (this.comment()?.length ?? 0) > 0);
    protected readonly avatarSize = AvatarSize;

    private commentForm = viewChild<NgForm>('commentForm');

    constructor(
        private statusesService: StatusesService,
        private instanceService: InstanceService,
        private messageService: MessagesService
    ) {
        effect(() => this.fillUserName(this.status()));
    }

    ngOnInit(): void {
        this.maxStatusLength.set(this.instanceService.instance?.configuration?.statuses?.maxCharacters ?? 500);
        this.fillUserName(this.status());
    }

    protected async onSubmitComment(): Promise<void> {
        try {
            if (this.status != null) {
                this.isDuringSave.set(true);

                const newStatusRequest = new StatusRequest();
                newStatusRequest.note = this.comment() ?? '';
                newStatusRequest.replyToStatusId = this.status().id;

                await this.statusesService.create(newStatusRequest);

                this.commentForm()?.resetForm();
                this.fillUserName(this.status());

                this.messageService.showSuccess('Comment has been added.');
                this.added.emit();
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringSave.set(false);
        }
    }

    protected onCancel(): void {
        this.clickCancel.emit();
    }

    private fillUserName(status: Status): void {
        const userName = status.user?.userName;
        if (userName) {
            this.comment.set(`@${userName} `);
        }
    }
}
