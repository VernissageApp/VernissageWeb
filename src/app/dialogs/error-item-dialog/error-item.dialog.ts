import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorItem } from 'src/app/models/error-item';

@Component({
    selector: 'app-error-item-dialog',
    templateUrl: 'error-item.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ErrorItemDialog implements OnInit {
    protected code = signal('');
    protected message = signal('');
    protected exception = signal('');

    private dialogRef = inject(MatDialogRef<ErrorItem>);
    private data?: ErrorItem = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.code.set(this.data?.code ?? '');
        this.message.set(this.data?.message ?? '');
        this.exception.set(this.data?.exception ?? '');
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }
}
