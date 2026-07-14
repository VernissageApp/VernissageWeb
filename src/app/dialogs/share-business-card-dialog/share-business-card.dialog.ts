import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-share-business-card-dialog',
    templateUrl: 'share-business-card.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, CdkTextareaAutosize, MatDialogActions, MatButton, TranslatePipe]
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
