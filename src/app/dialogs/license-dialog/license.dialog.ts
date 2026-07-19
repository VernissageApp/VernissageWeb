import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { License } from 'src/app/models/license';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LicensesService } from 'src/app/services/http/licenses.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-license-dialog',
    templateUrl: 'license.dialog.html',
    styleUrls: ['license.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, CdkTextareaAutosize, MatDialogActions, MatButton, TranslatePipe]
})
export class LicenseDialog implements OnInit {
    protected name = model('');
    protected code = model('');
    protected description = model('');
    protected url = model('');

    private messageService = inject(MessagesService);
    private licensesService = inject(LicensesService);
    private dialogRef = inject(MatDialogRef<LicenseDialog>);
    private data?: License = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);

    public ngOnInit(): void {
        if (this.data) {
            this.name.set(this.data.name ?? '');
            this.code.set(this.data.code ?? '');
            this.description.set(this.data.description ?? '');
            this.url.set(this.data.url ?? '');
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.name = this.name();
                this.data.code = this.code();
                this.data.description = this.description();
                this.data.url = this.url();

                await this.licensesService.update(this.data?.id, this.data);
                this.messageService.showSuccess(this.translateService.instant('dialogs.license.messages.licenseHasBeenUpdated'));
            } else {
                const newLicense = new License();
                newLicense.name = this.name();
                newLicense.code = this.code();
                newLicense.description = this.description();
                newLicense.url = this.url();

                await this.licensesService.create(newLicense);
                this.messageService.showSuccess(this.translateService.instant('dialogs.license.messages.newLicenseHasBeenCreated'));
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
