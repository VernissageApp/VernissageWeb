import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ErrorItem } from 'src/app/models/error-item';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-error-item-dialog',
    templateUrl: 'error-item.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, FormsModule, CdkTextareaAutosize, MatDialogActions, MatButton, TranslatePipe]
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
