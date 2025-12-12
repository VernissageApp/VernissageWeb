import { ChangeDetectionStrategy, Component, computed, inject, model, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { BusinessCard } from 'src/app/models/business-card';
import { BusinessCardField } from 'src/app/models/business-card-field';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { BusinessCardsService } from 'src/app/services/http/business-cards.service';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-edit-business-card',
    templateUrl: './edit-business-card.page.html',
    styleUrls: ['./edit-business-card.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EditBusinessCardPage extends ResponsiveComponent implements OnInit {
    protected user = signal<User | undefined>(undefined);
    protected isReady = signal(false);
    
    protected id = model('');
    protected title = model('');
    protected subtitle = model('');
    protected body = model('');
    protected website = model('');
    protected telephone = model('');
    protected email = model('');
    protected color1 = model('#ad5389');
    protected color2 = model('#3c1053');
    protected color3 = model('#ffffff');
    protected fields = signal<BusinessCardField[]>([]);

    protected topColor = computed(() => {
        return `linear-gradient(${this.color1()}, ${this.color2()});`;
    });

    private router = inject(Router);
    private authorizationService = inject(AuthorizationService);
    private usersService = inject(UsersService);
    private loadingService = inject(LoadingService);
    private businessCardsService = inject(BusinessCardsService);
    private messageService = inject(MessagesService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.loadingService.showLoader();

        const userInternal = this.authorizationService.getUser();
        if (!userInternal || !userInternal.userName) {
            throw new ForbiddenError();
        }

        // Download business card from database or create based on user profile.
        await this.downloadBusinessCard(userInternal.userName);

        this.isReady.set(true);
        this.loadingService.hideLoader();
    }

    protected onAddField(): void {
        this.fields?.update((fields) => {
            fields?.push(new BusinessCardField(undefined, '', ''));
            return [...fields];
        });
    }

    protected onDeleteField(businessCardField: BusinessCardField): void {
        this.fields?.update((fields) => {
            const index = fields?.indexOf(businessCardField);
            if (index != undefined) {
                fields?.splice(index, 1);
            }

            return [...fields];
        });
    }

    protected updateFields(): void {
        this.fields?.update((fields) => {
            return [...fields];
        });
    }

    protected onCancelClick(): void {
        this.router.navigate(['/shared-cards']);
    }

    protected async onSubmit(): Promise<void> {
        try {
            const businessCard = new BusinessCard();
            businessCard.id = this.id();
            businessCard.title = this.title();
            businessCard.subtitle = this.subtitle();
            businessCard.body = this.body();
            businessCard.website = this.website();
            businessCard.telephone = this.telephone();;
            businessCard.email = this.email();
            businessCard.color1 = this.color1();
            businessCard.color2 = this.color2();
            businessCard.color3 = this.color3();
            businessCard.fields = this.fields();

            if (this.id()) {
                await this.businessCardsService.update(businessCard);
                this.messageService.showSuccess('Business card was updated.');                
            } else {
                await this.businessCardsService.create(businessCard);
                this.messageService.showSuccess('Business card was saved.');
            }
            
            this.router.navigate(['/shared-cards']);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private async downloadBusinessCard(userName: string): Promise<void> {
        try {
            const businessCard = await this.businessCardsService.read();
            this.user.set(businessCard.user);

            this.id.set(businessCard.id ?? '');
            this.title.set(businessCard.title);
            this.subtitle.set(businessCard.subtitle ?? '');
            this.body.set(businessCard.body ?? '');
            this.website.set(businessCard.website ?? '');
            this.telephone.set(businessCard.telephone ?? '');
            this.email.set(businessCard.email ?? '');
            this.color1.set(businessCard.color1 ?? '');
            this.color2.set(businessCard.color2 ?? '');
            this.color3.set(businessCard.color3 ?? '');

            const internalBusinessCardFields = businessCard.fields;
            if (internalBusinessCardFields) {
                this.fields.set(internalBusinessCardFields.map((field) => { return new BusinessCardField(field.id, field.key, field.value); }));
            }
        } catch {
            const downloadUser = await this.usersService.profile(userName);
            this.user.set(downloadUser);
    
            this.title.set(this.user()?.name ?? '');
            this.subtitle.set('@' + (this.user()?.userName ?? ''));
            this.body.set(this.user()?.bio ?? '');
    
            const userFields = this.user()?.fields;
            if (userFields) {
                this.fields.set(userFields.map((field) => { return new BusinessCardField(undefined, field.key ?? '', field.value ?? ''); }));
            }
        }
    }
}
