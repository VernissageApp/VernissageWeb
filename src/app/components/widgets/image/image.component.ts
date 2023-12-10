import { Component, Input, OnInit } from '@angular/core';
import { AvatarSize } from '../avatar/avatar-size';
import { User } from 'src/app/models/user';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { Status } from 'src/app/models/status';
import { Attachment } from 'src/app/models/attachment';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { MessagesService } from 'src/app/services/common/messages.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
    readonly avatarSize = AvatarSize;

    @Input() horizontal = true;
    @Input() status?: Status;

    imageSrc?: string;
    alt?: string;
    user?: User;
    signedInUser?: User;

    showAvatar = true;
    showAltIcon = false;
    showFavourites = false;

    constructor(
        private preferencesService: PreferencesService,
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService) {
    }

    ngOnInit(): void {
        this.imageSrc = this.getMainAttachmentSrc();
        this.alt = this.getMainAttachmentAlt();
        this.user = this.getMainStatus()?.user;

        this.showAvatar = this.preferencesService.showAvatars;
        this.showAltIcon = this.preferencesService.showAltIcon;
        this.showFavourites = this.preferencesService.showFavourites;

        this.signedInUser = this.authorizationService.getUser();
    }

    async favouriteToogle(): Promise<void> {
        const mainStatus = this.getMainStatus();

        if (mainStatus) {
            try {
                if (mainStatus.favourited) {
                    await this.statusesService.unfavourite(mainStatus.id);
                    mainStatus.favourited = false;
                    this.messageService.showSuccess('Status unfavourited.');
                } else {
                    await this.statusesService.favourite(mainStatus.id);
                    mainStatus.favourited = true;
                    this.messageService.showSuccess('Status favourited.');
                }
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    protected getMainStatus(): Status | undefined {
        return this.status?.reblog ?? this.status;
    }

    private getMainAttachmentSrc(): string {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.smallFile?.url ?? '';
        }

        return '';
    }

    private getMainAttachmentAlt(): string | undefined {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.description;
        }

        return undefined;
    }

    private getMainAttachment(status: Status): Attachment | null {
        const mainStatus = status.reblog ?? status;

        if (!mainStatus.attachments) {
            return null;
        }
    
        if (mainStatus.attachments?.length === 0) {
            return null;
        }
    
        return mainStatus.attachments[0]
    }
}
