import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: 'confirmation.dialog.html',
    styleUrls: ['confirmation.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, TranslatePipe]
})
export class ConfirmationDialog implements OnInit {
    protected text = signal('');

    private dialogRef = inject(MatDialogRef<ConfirmationDialog>);
    private data?: string = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.text.set(this.data ?? '');
    }

    protected onNoClick(): void {
        this.dialogRef.close({ confirmed: false});
    }

    protected async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmed: true});
    }
}
