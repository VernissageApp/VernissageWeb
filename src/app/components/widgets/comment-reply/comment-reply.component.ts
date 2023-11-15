import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Status } from 'src/app/models/status';
import { StatusRequest } from 'src/app/models/status-request';
import { User } from 'src/app/models/user';
import { MessagesService } from 'src/app/services/common/messages.service';
import { StatusesService } from 'src/app/services/http/statuses.service';

@Component({
    selector: 'app-comment-reply',
    templateUrl: './comment-reply.component.html',
    styleUrls: ['./comment-reply.component.scss']
})
export class CommentReplyComponent {
    @Input() signedInUser?: User;
    @Input() status?: Status;
    @Output() close = new EventEmitter();

    comment = '';

    constructor(private statusesService: StatusesService, private messageService: MessagesService) {
    }

    async onSubmitComment(): Promise<void> {
        try {
            if (this.status != null) {
                const newStatusRequest = new StatusRequest();
                newStatusRequest.note = this.comment;
                newStatusRequest.replyToStatusId = this.status.id;

                await this.statusesService.create(newStatusRequest);

                this.messageService.showSuccess('Comment has been added.');
                this.close.emit();
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
