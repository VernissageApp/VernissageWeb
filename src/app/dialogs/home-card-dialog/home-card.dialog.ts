import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { HomeCard } from 'src/app/models/home-card';
import { MessagesService } from 'src/app/services/common/messages.service';
import { HomeCardsService } from 'src/app/services/http/home-cards.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-home-card-dialog',
    templateUrl: 'home-card.dialog.html',
    styleUrls: ['home-card.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, CdkTextareaAutosize, MatDialogActions, MatButton, TranslatePipe]
})
export class HomeCardDialog implements OnInit {
    protected title = model('');
    protected body = model('');
    protected order = model(0);

    private messageService = inject(MessagesService);
    private homeCardsService = inject(HomeCardsService);
    private dialogRef = inject(MatDialogRef<HomeCardDialog>);
    private data?: HomeCard = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);

    public ngOnInit(): void {
        if (this.data) {
            this.title.set(this.data.title ?? '');
            this.body.set(this.data.body ?? '');
            this.order.set(this.data.order ?? 0);
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.title = this.title();
                this.data.body = this.body();
                this.data.order = this.order();

                await this.homeCardsService.update(this.data?.id, this.data);
                this.messageService.showSuccess(this.translateService.instant('dialogs.homeCard.messages.homeCardHasBeenUpdated'));
            } else {
                const newHomeCard = new HomeCard();
                newHomeCard.title = this.title();
                newHomeCard.body = this.body();
                newHomeCard.order = this.order();

                await this.homeCardsService.create(newHomeCard);
                this.messageService.showSuccess(this.translateService.instant('dialogs.homeCard.messages.newHomeCardHasBeenCreated'));
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
