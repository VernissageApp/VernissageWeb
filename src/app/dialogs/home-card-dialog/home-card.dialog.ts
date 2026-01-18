import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeCard } from 'src/app/models/home-card';
import { MessagesService } from 'src/app/services/common/messages.service';
import { HomeCardsService } from 'src/app/services/http/home-cards.service';

@Component({
    selector: 'app-home-card-dialog',
    templateUrl: 'home-card.dialog.html',
    styleUrls: ['home-card.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeCardDialog implements OnInit {
    protected title = model('');
    protected body = model('');
    protected order = model(0);

    private messageService = inject(MessagesService);
    private homeCardsService = inject(HomeCardsService);
    private dialogRef = inject(MatDialogRef<HomeCardDialog>);
    private data?: HomeCard = inject(MAT_DIALOG_DATA);

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
                this.messageService.showSuccess('Home card has been updated.');
            } else {
                const newHomeCard = new HomeCard();
                newHomeCard.title = this.title();
                newHomeCard.body = this.body();
                newHomeCard.order = this.order();

                await this.homeCardsService.create(newHomeCard);
                this.messageService.showSuccess('New home card has been created.');
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
