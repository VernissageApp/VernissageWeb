import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, OnDestroy, OnInit, PLATFORM_ID, signal, viewChild } from '@angular/core';
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
    styleUrls: ['./image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ImageComponent implements OnInit, OnDestroy, AfterViewInit {
    public avatarVisible = input(true);
    public horizontal = input(true);
    public priority =  input(false);
    public status = input.required<Status>();

    protected readonly avatarSize = AvatarSize;
    protected mainStatus = computed(() => { return this.status()?.reblog ?? this.status(); });
    protected mouseenter = new Subject<void>();
    protected mouseleave = new Subject<void>();

    protected imageSrc = signal('');
    protected alt = signal<string | undefined>(undefined);
    protected user = signal<User | undefined>(undefined);
    protected relationship = signal<Relationship | undefined>(undefined);
    protected signedInUser = signal<User | undefined>(undefined);
    protected showAltIcon = signal(false);
    protected showFavourites = signal(false);
    protected showReblog = signal(false);
	protected showAvatar = signal(false);
	protected showCount = signal(true);
    protected width = signal(0);
    protected height = signal(0);
	protected attachmentCount = computed(() => this.mainStatus()?.attachments?.length ?? 0);
    protected internalPriority = signal<boolean | undefined>(undefined);
    protected dataUrl = signal('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABV1JREFUWEeFl+uSFUUQhKt65uwzLyheUFh/Di4LIiAIangJRV5vZ6bbyMyq7jlAhITtHJY9k19lVVdX+9Uv75uZWTGzyc2mYja72amYndxsxrM0/mzyFsvMvZkbvtr4XzWzimcz25rZXt22prXyc+HnPVd82z8CSNGAmEsLEIgLomAZAPCnCaM1iktAz/8FaGb+8O37hhcV10KkXCEMJ2Zv/Hu6AABEnwDAqAFQzW2vcGEAZPT6WSEcYPEGAigFGeFIAYTTfkJECtIBGsD49X85cB59ih7FCWBa/uDNvwKAvawDRXrKJyMfC+IT2I81kPnnU3keDiD3xTYb0e9W+HsQ9m9/fvdJAEZvEhYMHKqqAdOygGiqQxYiawBpiKKTeEDAfosUZBHef/2OLKwBM5tDFM8Unq0OAIpXFmLugtgLih7iCZDCFJ0Icg7g5l+/+odFiJfBWlQ6BQFAGHzWogMJwDQgZkUvB4Y4hCQo4a1NEo+F32URfvXT3zQQ0cNWOsA1hE8Nwlg7IehAl1URAqU5AFJEghsB+M146tsd4IuXf8mBhiKEC9XmlgC7QXzG1wmB17CEgj8c8HSgWPUA8BSdbfcBsTu+DZVw4N7zP/s2LE1pmCHaIL7LiQaAzSY8yY8s6xVsRARwigtgoujus21OfH7Onw8P3fyzH/8IB6IGQpwQdbe5becATSbnTu4AIU4AiBHgFJ8HSA1nmquX+t1nvzdvqugJDsBqRA7xBKiAgAObFQA07Gq1EhYhHHA4MFktE597SfGTXIhV+cyN7OZ3nv42HKB4tYnCANhirTbVAKisaSutmnEXoB8AoBzEZ6sEONkWzyMAQVHGDoAnv6orZ/Q1ALr4ZlNdba6CKG2lC9pwB4CC/MOBmdET4AMI/ptzQ7NWmILLm7fdAUSF6OkAAHY4sNq0JwDEsTZzQHQH3BoAYH+J6MuFAPBELURKlIKJjmHz++XjN81atFdEj0rfBwCj32/pAlcHUB3wSEQKCADxIwAgAqRDIHp0mkjB5fXrhh7AdtwBlPspHBgAAlERKg0DQAXYwvpK4QvbPgKYlaqYKPzO96/OaqBkCs7sv2UahgNrrwGciigm6ynI/Gf0SIFcwG7oKYh+6ncfvWQjQhGOGggHWAcQvo0iVA0gDVmEADCPGoC1vQjDgS6uXYH8ywHUARrRoxecqZBPAWCh8o9bEEWY9q/s6ijCgiJMABQV8o8oz4rvwjZsx0NTYj/NXfD58lyHEZpR7wPa8+oDsp5PNqO1n3NsRlmEBMCLkQJUuqp/iEdDwsnC8yB2wb3l2dk2pAvRhASxRheU9YSIM08AkQIARB9QnqMRWULMtulYUxriSPMvlx/OawDZQSECItrv3AICByracR66Hg5gD6EOMr8JYDgDThQeK8/UnAeWp2MbZh3QBfF2iHjFGCswFeE8UB+waCw6bKL3H4RXfo5jOUYzdsL7y5MoQjUj1ieP3XCBr0vzcrRQAbKZajbXToCtUeGBz0koxVeOZRPnxZwq/JvlZtRAjFs5/Wgqkijd4EQUMwEAOBeGA2plkdsUCnFCTILpgyl+18wfLDdxRdBIlvMKJyOIeohzHhwAeUPSUHJwgANozIKImKJDHCC6PQXAw+WxijBGbV1QcgiNiQgQAcBnRJ8pUBZyRgoAjuUpXgiB6LH67QjfuiKArKQDMfkSIhedkPCHABjn8w/942guCABsVaIEiM95SeXN6Gq5jrEct6NIQVxCdB+oNpch3gEIqyJMB1pcuZiCiFSiB/HDTZk18N1yPVIQtx5dz85FB0jckBJA6Y8bsltj/nFBTbtDnH/HVX1c0+HAfzYw+Bz5bvwbAAAAAElFTkSuQmCC');
    protected imageIsLoaded = signal(false);
    protected isFavourited = signal(false);
    protected isReblogged = signal(false);
    protected imageCutHackLoaded = signal(false);

    private readonly imageCutHackTimeout = 100;
    private popover = viewChild<SatPopoverComponent | undefined>('popover');
    private canvas = viewChild<ElementRef<HTMLCanvasElement> | undefined>('canvas');

    private routeNavigationStartSubscription?: Subscription;
    private isBrowser = false;
    private blurhash = '';

    private platformId = inject(PLATFORM_ID);
    private preferencesService = inject(PreferencesService);
    private statusesService = inject(StatusesService);
    private relationshipsService = inject(RelationshipsService);
    private router = inject(Router);
    private messageService = inject(MessagesService);
    private authorizationService = inject(AuthorizationService);

    constructor() {
            this.isBrowser = isPlatformBrowser(this.platformId);

            // Because <app-image> components are reused by Angular when we have trackBy directive,
            // we cannot change priority from false to true (Angular is throwing an exception then).
            effect(() => {

                const newPriorityValue = this.priority();
                if (this.internalPriority() === undefined) {
                    this.internalPriority.set(newPriorityValue);
                }
            });

            effect(() => {
                this.showAvatar.set(this.preferencesService.showAvatars && this.avatarVisible());
            });
    }

    ngOnInit(): void {
        this.imageSrc.set(this.getMainAttachmentSrc());
        this.alt.set(this.getMainAttachmentAlt());
        this.width.set(this.getMainAttachmentWidth());
        this.height.set(this.getMainAttachmentHeight());
        this.user.set(this.mainStatus().user);
        this.isFavourited.set(this.mainStatus().favourited);
        this.isReblogged.set(this.mainStatus().reblogged);
        this.signedInUser.set(this.authorizationService.getUser());

        this.showAltIcon.set(this.preferencesService.showAltIcon);
        this.showFavourites.set(this.preferencesService.showFavourites);
        this.showReblog.set(this.preferencesService.showReblog);
		this.showAvatar.set(this.preferencesService.showAvatars && this.avatarVisible());
		this.showCount.set(this.preferencesService.showCounts);

        this.blurhash = this.getMainAttachmentBlurhash();

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(() => {
                this.popover()?.close();
                this.mouseleave.next();
            });
    }

    ngOnDestroy(): void {
        this.popover()?.close();
        this.routeNavigationStartSubscription?.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.drawCanvas();

        this.mouseenter
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseleave))))
            .subscribe(async () => {
                this.popover()?.open();

                const userInternal = this.user();
                if (userInternal && userInternal.id && this.signedInUser()?.id !== userInternal.id) {
                    const downloadedRelationship = await this.relationshipsService.get(userInternal.id);
                    this.relationship.set(downloadedRelationship);
                }
            });
  
        this.mouseleave
            .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.mouseenter))))
            .subscribe(() => {
                this.popover()?.close();
            });
    }

    protected async favouriteToggle(): Promise<void> {
        try {
            if (this.isFavourited()) {
                await this.statusesService.unfavourite(this.mainStatus().id);
                this.isFavourited.set(false);
                this.messageService.showSuccess('Your like has been undone.');
            } else {
                await this.statusesService.favourite(this.mainStatus().id);
                this.isFavourited.set(true);
                this.messageService.showSuccess('Status favourited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async reblogToggle(): Promise<void> {
        try {
            if (this.isReblogged()) {
                await this.statusesService.unreblog(this.mainStatus().id);
                this.isReblogged.set(false);
                this.messageService.showSuccess('Your boost has been undone.');
            } else {
                await this.statusesService.reblog(this.mainStatus().id);
                this.isReblogged.set(true);
                this.messageService.showSuccess('Status boosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected onImageLoaded(): void {
        this.imageIsLoaded.set(true);

        setTimeout(() => {
            this.imageCutHackLoaded.set(true);
        }, this.imageCutHackTimeout);
    }

    private drawCanvas(): void {
        if (!this.isBrowser) {
            return;
        }

        if (!this.blurhash) {
            return;
        }

        const internalCanvas = this.canvas();
        if (!internalCanvas) {
            return;
        }

        const pixels = decode(this.blurhash, 32, 32);
        const ctx = internalCanvas.nativeElement.getContext('2d');

        if (!ctx) {
            return;
        }

        const imageData = ctx.createImageData(32, 32);
        if (!imageData) {
            return;
        }

        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);

        const blurhashDataUrl = internalCanvas.nativeElement.toDataURL();
        if (blurhashDataUrl) {
            this.dataUrl.set(blurhashDataUrl);
        }
    }

    private getMainAttachmentSrc(): string {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.smallFile?.url ?? '';
    }

    private getMainAttachmentAlt(): string | undefined {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.description;
    }

    private getMainAttachmentBlurhash(): string {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    private getMainAttachmentWidth(): number {
        const mainAttachment = this.getMainAttachment();
        return mainAttachment?.smallFile?.width ?? 0;
    }

	private getMainAttachmentHeight(): number {
	    const mainAttachment = this.getMainAttachment();
	    return mainAttachment?.smallFile?.height ?? 0;
	}

    private getMainAttachment(): Attachment | null {
        const internalMainStatus = this.mainStatus();
		
		console.log(internalMainStatus)

        if (!internalMainStatus.attachments) {
            return null;
        }
    
        if (internalMainStatus.attachments?.length === 0) {
            return null;
        }

        return internalMainStatus.attachments[0];
    }
}
