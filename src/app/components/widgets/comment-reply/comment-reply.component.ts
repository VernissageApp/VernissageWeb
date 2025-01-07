import { ChangeDetectionStrategy, Component, input, model, OnInit, output, signal, viewChild } from '@angular/core';
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
    protected isSendDisabled = signal(false);
    protected readonly avatarSize = AvatarSize;

    private commentForm = viewChild<NgForm>('commentForm');

    constructor(
        private statusesService: StatusesService,
        private instanceService: InstanceService,
        private messageService: MessagesService) {
    }

    ngOnInit(): void {
        this.maxStatusLength.set(this.instanceService.instance?.configuration?.statuses?.maxCharacters ?? 500);
    }

    protected async onSubmitComment(): Promise<void> {
        try {
            if (this.status != null) {
                this.isSendDisabled.set(true);

                const newStatusRequest = new StatusRequest();
                newStatusRequest.note = this.comment() ?? '';
                newStatusRequest.replyToStatusId = this.status().id;

                await this.statusesService.create(newStatusRequest);

                this.comment.set('');
                this.commentForm()?.resetForm();
                this.messageService.showSuccess('Comment has been added.');
                this.added.emit();
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isSendDisabled.set(false);
        }
    }

    protected onCancel(): void {
        this.clickCancel.emit();
    }
}
