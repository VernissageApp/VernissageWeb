import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
    readonly avatarSize = AvatarSize;

    @Input() signedInUser?: User;
    @Input() status?: Status;
    @Input() showCancel = false;
    @Output() cancel = new EventEmitter();
    @Output() added = new EventEmitter();

    @ViewChild('commentForm') commentForm?: NgForm;

    comment = '';
    isSendDisabled = false;

    constructor(private statusesService: StatusesService, private messageService: MessagesService) {
    }

    async onSubmitComment(): Promise<void> {
        try {
            if (this.status != null) {
                this.isSendDisabled = true;

                const newStatusRequest = new StatusRequest();
                newStatusRequest.note = this.comment;
                newStatusRequest.replyToStatusId = this.status.id;

                await this.statusesService.create(newStatusRequest);

                this.comment = ''
                this.commentForm?.resetForm();
                this.messageService.showSuccess('Comment has been added.');
                this.added.emit();
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isSendDisabled = false;
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
