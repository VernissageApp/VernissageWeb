import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { StatusActivityPubEvent } from 'src/app/models/status-activity-pub-event';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-status-event-error-message-dialog',
    templateUrl: 'status-event-error-message.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, CdkTextareaAutosize, FormsModule, MatDialogActions, MatButton, TranslatePipe]
})
export class StatusEventErrorMessageDialog implements OnInit {
    protected errorMessage = signal('');

    private dialogRef = inject(MatDialogRef<StatusActivityPubEvent>);
    private data?: StatusActivityPubEvent = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.errorMessage.set(this.data?.errorMessage ?? '');
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }
}
