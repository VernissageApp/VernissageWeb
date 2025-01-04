import { Component, input, model, output, signal, viewChild } from '@angular/core';
import { Status } from 'src/app/models/status';
import { StatusRequest } from 'src/app/models/status-request';
import { User } from 'src/app/models/user';
import { MessagesService } from 'src/app/services/common/messages.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { AvatarSize } from '../avatar/avatar-size';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-comment-reply',
    templateUrl: './comment-reply.component.html',
    styleUrls: ['./comment-reply.component.scss'],
    standalone: false
})
export class CommentReplyComponent {
    public signedInUser = input.required<User>();
    public status = input.required<Status>();
    public showCancel = input(false);
    public clickCancel = output();
    public added = output();

    protected comment = model('');
    protected isSendDisabled = signal(false);
    protected readonly avatarSize = AvatarSize;

    private commentForm = viewChild<NgForm>('commentForm');

    constructor(private statusesService: StatusesService, private messageService: MessagesService) {
    }

    async onSubmitComment(): Promise<void> {
        try {
            if (this.status != null) {
                this.isSendDisabled.set(true);

                const newStatusRequest = new StatusRequest();
                newStatusRequest.note = this.comment();
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

    onCancel(): void {
        this.clickCancel.emit();
    }
}
