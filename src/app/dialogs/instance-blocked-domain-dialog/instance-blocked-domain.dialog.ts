import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { MessagesService } from 'src/app/services/common/messages.service';
import { InstanceBlockedDomainsService } from 'src/app/services/http/instance-blocked-domains.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-instance-blocked-domain-dialog',
    templateUrl: 'instance-blocked-domain.dialog.html',
    styleUrls: ['instance-blocked-domain.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class InstanceBlockedDomainDialog implements OnInit {
    protected domain = model('');
    protected reason = model('');

    private messageService = inject(MessagesService);
    private instanceBlockedDomainsService = inject(InstanceBlockedDomainsService);
    private dialogRef = inject(MatDialogRef<InstanceBlockedDomainDialog>);
    private data?: InstanceBlockedDomain = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);

    ngOnInit(): void {
        if (this.data) {
            this.domain.set(this.data.domain);
            this.reason.set(this.data.reason ?? '');
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.domain = this.domain();
                this.data.reason = this.reason();

                await this.instanceBlockedDomainsService.update(this.data?.id, this.data);
                this.messageService.showSuccess(this.translateService.instant('dialogs.instanceBlockedDomain.messages.domainHasBeenUpdated'));
            } else {
                const newDomain = new InstanceBlockedDomain();
                newDomain.domain = this.domain();
                newDomain.reason = this.reason();

                await this.instanceBlockedDomainsService.create(newDomain);
                this.messageService.showSuccess(this.translateService.instant('dialogs.instanceBlockedDomain.messages.newDomainHasBeenCreated'));
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
