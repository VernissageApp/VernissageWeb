import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { License } from 'src/app/models/license';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LicensesService } from 'src/app/services/http/licenses.service';

@Component({
    selector: 'app-license-dialog',
    templateUrl: 'license.dialog.html',
    styleUrls: ['license.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
                this.messageService.showSuccess('License has been updated.');
            } else {
                const newLicense = new License();
                newLicense.name = this.name();
                newLicense.code = this.code();
                newLicense.description = this.description();
                newLicense.url = this.url();

                await this.licensesService.create(newLicense);
                this.messageService.showSuccess('New license has been created.');
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
