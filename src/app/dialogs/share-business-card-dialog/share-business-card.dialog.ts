import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';

@Component({
    selector: 'app-share-business-card-dialog',
    templateUrl: 'share-business-card.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ShareBusinessCardDialog implements OnInit {
    protected title = model('');
    protected note = model('');
    
    private dialogRef = inject(MatDialogRef<ShareBusinessCardDialog>);
    private data?: SharedBusinessCard = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.title.set(this.data?.title ?? '');
        this.note.set(this.data?.note ?? '');
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const sharedBusinessCard = this.data ?? new SharedBusinessCard();
        sharedBusinessCard.title = this.title();
        sharedBusinessCard.note = this.note();

        this.dialogRef.close(sharedBusinessCard);
    }
}
