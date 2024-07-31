import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { MessagesService } from 'src/app/services/common/messages.service';
import { InstanceBlockedDomainsService } from 'src/app/services/http/instance-blocked-domains.service';

@Component({
    selector: 'app-instance-blocked-domain-dialog',
    templateUrl: 'instance-blocked-domain.dialog.html',
    styleUrls: ['instance-blocked-domain.dialog.scss']
})
export class InstanceBlockedDomainDialog {
    domain = '';
    reason = '';

    constructor(
        private messageService: MessagesService,
        private instanceBlockedDomainsService: InstanceBlockedDomainsService,
        public dialogRef: MatDialogRef<InstanceBlockedDomainDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: InstanceBlockedDomain) {
            if (this.data) {
                this.domain = this.data.domain;
                this.reason = this.data.reason ?? '';
            }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.domain = this.domain;
                this.data.reason = this.reason;

                await this.instanceBlockedDomainsService.update(this.data?.id, this.data);
                this.messageService.showSuccess('Domain has been updated.');
            } else {
                const newDomain = new InstanceBlockedDomain();
                newDomain.domain = this.domain;
                newDomain.reason = this.reason;

                await this.instanceBlockedDomainsService.create(newDomain);
                this.messageService.showSuccess('New domain has been created.');
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}