import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { decode } from 'blurhash';
import { AvatarSize } from '../avatar/avatar-size';
import { User } from 'src/app/models/user';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { Status } from 'src/app/models/status';
import { Attachment } from 'src/app/models/attachment';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { isPlatformBrowser } from '@angular/common';
import { delay, filter, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { SatPopoverComponent } from '@ncstate/sat-popover';
import { NavigationStart, Router } from '@angular/router';
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    readonly avatarSize = AvatarSize;

    @Input() horizontal = true;
    @Input() status?: Status;
    @Input() avatarVisible = true;
    @Input() priority = false;

    @ViewChild('popover') popover?: SatPopoverComponent;
    mouseenter = new Subject<void>();
    mouseleave = new Subject<void>();
    routeNavigationStartSubscription?: Subscription;

    imageSrc = '';
    alt?: string;
    blurhash?: string;
    user?: User;
    relationship?: Relationship;
    signedInUser?: User;
    width = 0;
    height = 0;
    isBrowser = false;
    internalPriority = false;
    dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABV1JREFUWEeFl+uSFUUQhKt65uwzLyheUFh/Di4LIiAIangJRV5vZ6bbyMyq7jlAhITtHJY9k19lVVdX+9Uv75uZWTGzyc2mYja72amYndxsxrM0/mzyFsvMvZkbvtr4XzWzimcz25rZXt22prXyc+HnPVd82z8CSNGAmEsLEIgLomAZAPCnCaM1iktAz/8FaGb+8O37hhcV10KkXCEMJ2Zv/Hu6AABEnwDAqAFQzW2vcGEAZPT6WSEcYPEGAigFGeFIAYTTfkJECtIBGsD49X85cB59ih7FCWBa/uDNvwKAvawDRXrKJyMfC+IT2I81kPnnU3keDiD3xTYb0e9W+HsQ9m9/fvdJAEZvEhYMHKqqAdOygGiqQxYiawBpiKKTeEDAfosUZBHef/2OLKwBM5tDFM8Unq0OAIpXFmLugtgLih7iCZDCFJ0Icg7g5l+/+odFiJfBWlQ6BQFAGHzWogMJwDQgZkUvB4Y4hCQo4a1NEo+F32URfvXT3zQQ0cNWOsA1hE8Nwlg7IehAl1URAqU5AFJEghsB+M146tsd4IuXf8mBhiKEC9XmlgC7QXzG1wmB17CEgj8c8HSgWPUA8BSdbfcBsTu+DZVw4N7zP/s2LE1pmCHaIL7LiQaAzSY8yY8s6xVsRARwigtgoujus21OfH7Onw8P3fyzH/8IB6IGQpwQdbe5becATSbnTu4AIU4AiBHgFJ8HSA1nmquX+t1nvzdvqugJDsBqRA7xBKiAgAObFQA07Gq1EhYhHHA4MFktE597SfGTXIhV+cyN7OZ3nv42HKB4tYnCANhirTbVAKisaSutmnEXoB8AoBzEZ6sEONkWzyMAQVHGDoAnv6orZ/Q1ALr4ZlNdba6CKG2lC9pwB4CC/MOBmdET4AMI/ptzQ7NWmILLm7fdAUSF6OkAAHY4sNq0JwDEsTZzQHQH3BoAYH+J6MuFAPBELURKlIKJjmHz++XjN81atFdEj0rfBwCj32/pAlcHUB3wSEQKCADxIwAgAqRDIHp0mkjB5fXrhh7AdtwBlPspHBgAAlERKg0DQAXYwvpK4QvbPgKYlaqYKPzO96/OaqBkCs7sv2UahgNrrwGciigm6ynI/Gf0SIFcwG7oKYh+6ncfvWQjQhGOGggHWAcQvo0iVA0gDVmEADCPGoC1vQjDgS6uXYH8ywHUARrRoxecqZBPAWCh8o9bEEWY9q/s6ijCgiJMABQV8o8oz4rvwjZsx0NTYj/NXfD58lyHEZpR7wPa8+oDsp5PNqO1n3NsRlmEBMCLkQJUuqp/iEdDwsnC8yB2wb3l2dk2pAvRhASxRheU9YSIM08AkQIARB9QnqMRWULMtulYUxriSPMvlx/OawDZQSECItrv3AICByracR66Hg5gD6EOMr8JYDgDThQeK8/UnAeWp2MbZh3QBfF2iHjFGCswFeE8UB+waCw6bKL3H4RXfo5jOUYzdsL7y5MoQjUj1ieP3XCBr0vzcrRQAbKZajbXToCtUeGBz0koxVeOZRPnxZwq/JvlZtRAjFs5/Wgqkijd4EQUMwEAOBeGA2plkdsUCnFCTILpgyl+18wfLDdxRdBIlvMKJyOIeohzHhwAeUPSUHJwgANozIKImKJDHCC6PQXAw+WxijBGbV1QcgiNiQgQAcBnRJ8pUBZyRgoAjuUpXgiB6LH67QjfuiKArKQDMfkSIhedkPCHABjn8w/942guCABsVaIEiM95SeXN6Gq5jrEct6NIQVxCdB+oNpch3gEIqyJMB1pcuZiCiFSiB/HDTZk18N1yPVIQtx5dz85FB0jckBJA6Y8bsltj/nFBTbtDnH/HVX1c0+HAfzYw+Bz5bvwbAAAAAElFTkSuQmCC';

    @ViewChild('canvas', { static: false }) readonly canvas?: ElementRef<HTMLCanvasElement>;

    showAltIcon = false;
    showFavourites = false;
    imageIsLoaded = false;

    get showAvatar() { return this.preferencesService.showAvatars && this.avatarVisible; }

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private preferencesService: PreferencesService,
        private statusesService: StatusesService,
        private relationshipsService: RelationshipsService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.imageSrc = this.getMainAttachmentSrc();
        this.alt = this.getMainAttachmentAlt();
        this.user = this.getMainStatus()?.user;
        this.blurhash = this.getMainAttachmentBlurhash();
        this.width = this.getMainAttachmentWidth();
        this.height = this.getMainAttachmentHeight();

        this.showAltIcon = this.preferencesService.showAltIcon;
        this.showFavourites = this.preferencesService.showFavourites;

        this.signedInUser = this.authorizationService.getUser();

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(() => {
                this.popover?.close();
                this.mouseleave.next();
            });
    }

    ngOnDestroy(): void {
        this.popover?.close();
        this.routeNavigationStartSubscription?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Because <app-image> components are reused by Angular when we have trackBy directive,
        // we cannot change priority from false to true (Angular is throwning an exception then).
        if (changes?.priority?.firstChange) {
            this.internalPriority = changes.priority.currentValue;
        }
    }

    ngAfterViewInit(): void {
        this.drawCanvas();

        this.mouseenter
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseleave))))
            .subscribe(async () => {
                this.popover?.open();

                if (this.user && this.user.id && this.signedInUser?.id !== this.user.id) {
                    this.relationship = await this.relationshipsService.get(this.user.id);
                }
            });
  
        this.mouseleave
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseenter))))
            .subscribe(() => {
                this.popover?.close();
            });
    }

    async favouriteToggle(): Promise<void> {
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

    onImageLoaded(): void {
        this.imageIsLoaded = true;
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

        const blurhashDataUrl = this.canvas.nativeElement.toDataURL();
        if (blurhashDataUrl) {
            this.dataUrl = blurhashDataUrl;
            this.changeDetectorRef.detectChanges();
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

    getMainAttachmentBlurhash(): string {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
        }

        return 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    getMainAttachmentWidth(): number {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.smallFile?.width ?? 0;
        }

        return 0;
    }

    getMainAttachmentHeight(): number {
        if (this.status) {
            const mainAttachment = this.getMainAttachment(this.status);
            return mainAttachment?.smallFile?.height ?? 0;
        }

        return 0;
    }
}
