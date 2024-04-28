import { AfterViewInit, Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';
import { decode } from 'blurhash';
import { AvatarSize } from '../avatar/avatar-size';
import { User } from 'src/app/models/user';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { Status } from 'src/app/models/status';
import { Attachment } from 'src/app/models/attachment';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { MessagesService } from 'src/app/services/common/messages.service';

@Component({
    selector: 'app-blurhash-image',
    templateUrl: './blurhash-image.component.html',
    styleUrls: ['./blurhash-image.component.scss']
})
export class BlurhashImageComponent implements AfterViewInit {
    readonly avatarSize = AvatarSize;
    
    @Input() horizontal = true;
    @Input() status?: Status;

    imageSrc?: string;
    alt?: string;
    blurhash?: string;
    user?: User;
    text?: string;
    signedInUser?: User;
    isBrowser = false;
    
    @ViewChild('canvas', { static: false }) readonly canvas?: ElementRef<HTMLCanvasElement>;
    @ViewChild('img', { static: false }) readonly img?: ElementRef<HTMLImageElement>;

    showBlurhash = true;
    showAvatar = true;
    showAltIcon = false;
    showFavourites = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private preferencesService: PreferencesService,
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService) {
    }

    ngOnInit(): void {
        this.imageSrc = this.getMainAttachmentSrc();
        this.alt = this.getMainAttachmentAlt();
        this.blurhash = this.getMainAttachmentBlurhash();
        this.user = this.getMainStatus()?.user;
        this.text = this.getMainStatus()?.contentWarning;

        this.showBlurhash = !this.preferencesService.alwaysShowNSFW;
        this.showAvatar = this.preferencesService.showAvatars;
        this.showAltIcon = this.preferencesService.showAltIcon;
        this.showFavourites = this.preferencesService.showFavourites;

        this.signedInUser = this.authorizationService.getUser();
    }

    ngAfterViewInit(): void {
        if (this.showBlurhash) {
            this.drawCanvas();
        }
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

    private drawCanvas(): void {
        if (!this.isBrowser) {
            return;
        }

        if (!this.blurhash) {
            return;
        }

        if (!this.canvas) {
            return;
        }

        const pixels = decode(this.blurhash, 32, 32);
        const ctx = this.canvas.nativeElement.getContext('2d');

        if (!ctx) {
            return;
        }

        const imageData = ctx.createImageData(32, 32);
        if (!imageData) {
            return;
        }

        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);
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

    getMainAttachmentBlurhash(): string {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
        }

        return 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }
}
