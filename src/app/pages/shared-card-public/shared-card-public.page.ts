import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { combineLatest, map, Subscription } from 'rxjs';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { UpdateSharedBusinessCardDialog } from 'src/app/dialogs/update-shared-business-card/update-shared-business-card.dialog';
import { BusinessCardField } from 'src/app/models/business-card-field';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { SharedBusinessCardMessage } from 'src/app/models/shared-business-card-message';
import { User } from 'src/app/models/user';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { SharedBusinessCardsService } from 'src/app/services/http/shared-business-cards.service';

@Component({
    selector: 'app-shared-card-public',
    templateUrl: './shared-card-public.page.html',
    styleUrls: ['./shared-card-public.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SharedCardPublicPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected avatarSize = AvatarSize;
    protected isReady = signal(false);

    protected message = model('');
    protected avatarUrl = signal('assets/user.svg');
    protected cardClientUser = signal<User | undefined>(undefined);
    protected sharedBusinessCardCode = signal('');
    protected userName = signal('');

    // Business card data.
    protected title = signal('');
    protected subtitle = signal('');
    protected body = signal('');
    protected website = signal('');
    protected telephone = signal('');
    protected email = signal('');
    protected color1 = signal('#ad5389');
    protected color2 = signal('#3c1053');
    protected color3 = signal('#ffffff');
    protected fields = signal<BusinessCardField[]>([]);

    // Shared card data.
    protected cardClientName = signal('');
    protected cardClientEmail = signal('');
    protected cardMessages = signal<SharedBusinessCardMessage[]>([]);

    private sharedBusinessCard?: SharedBusinessCard
    private routeParamsSubscription?: Subscription;

    private sharedBusinessCardsService = inject(SharedBusinessCardsService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);
    private messageService = inject(MessagesService);
    private dialog = inject(MatDialog);
    private router = inject(Router);

    protected isAuthor(message: SharedBusinessCardMessage): boolean {
        return !message.addedByUser;
    }

    protected async sendMessage(): Promise<void> {
        if (!this.message() || this.message().length === 0 || !this.sharedBusinessCardCode) {
            return;
        }

        try {
            const sharedBusinessCardMessage = new SharedBusinessCardMessage(this.message(), false);
            await this.sharedBusinessCardsService.messageByThirdParty(this.sharedBusinessCardCode(), sharedBusinessCardMessage);

            this.cardMessages.update((messages) => {
                return [...messages, new SharedBusinessCardMessage(this.message(), false)];
            });
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }

        this.message.set('');
    }


    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParamMap])
            .pipe(map(params => ({ routeParams: params[0], queryParams: params[1] })))
            .subscribe(async params => {
                this.isReady.set(false);
                this.loadingService.showLoader();

                const internalSharedBusinessCardCode = params.routeParams['code'] as string;
                if (internalSharedBusinessCardCode) {
                    this.sharedBusinessCard = await this.sharedBusinessCardsService.getByThirdParty(internalSharedBusinessCardCode);;
                    this.sharedBusinessCardCode.set(internalSharedBusinessCardCode);

                    if (this.sharedBusinessCard) {

                        if (this.sharedBusinessCard.businessCard) {
                            this.avatarUrl.set(this.sharedBusinessCard.businessCard.user?.avatarUrl ?? 'assets/user.svg');
                            this.userName.set(this.sharedBusinessCard.businessCard.user?.userName ?? '');

                            this.title.set(this.sharedBusinessCard.businessCard.title);
                            this.subtitle.set(this.sharedBusinessCard.businessCard.subtitle ?? '');
                            this.body.set(this.sharedBusinessCard.businessCard.body ?? '');
                            this.telephone.set(this.sharedBusinessCard.businessCard.telephone ?? '');
                            this.email.set(this.sharedBusinessCard.businessCard.email ?? '');

                            this.color1.set(this.sharedBusinessCard.businessCard.color1 ?? '#ad5389');
                            this.color2.set(this.sharedBusinessCard.businessCard.color2 ?? '#3c1053');
                            this.color3.set(this.sharedBusinessCard.businessCard.color3 ?? '#ffffff');

                            this.fields.set(this.sharedBusinessCard.businessCard.fields ?? []);
                        }
                        
                        this.cardClientName.set(this.sharedBusinessCard.thirdPartyName ?? '');
                        this.cardClientEmail.set(this.sharedBusinessCard.thirdPartyEmail ?? '');
                        this.refreshUserPersonalInfo();

                        this.cardMessages.set(this.sharedBusinessCard.messages ?? []);

                        if (params.queryParams.has('update')) {
                            await this.openUpdateSharedBusinessCardDialog();
                        }
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

    protected async openUpdateSharedBusinessCardDialog(): Promise<void> {
        const dialogRef = this.dialog.open(UpdateSharedBusinessCardDialog, {
            width: '500px',
            data: this.sharedBusinessCard
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    await this.sharedBusinessCardsService.updateByThirdParty(this.sharedBusinessCardCode(), result);

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
