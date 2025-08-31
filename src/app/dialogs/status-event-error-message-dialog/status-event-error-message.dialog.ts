import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StatusActivityPubEvent } from 'src/app/models/status-activity-pub-event';

@Component({
    selector: 'app-status-event-error-message-dialog',
    templateUrl: 'status-event-error-message.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
