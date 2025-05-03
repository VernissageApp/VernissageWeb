import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { MessagesService } from 'src/app/services/common/messages.service';
import { InstanceBlockedDomainsService } from 'src/app/services/http/instance-blocked-domains.service';

@Component({
    selector: 'app-instance-blocked-domain-dialog',
    templateUrl: 'instance-blocked-domain.dialog.html',
    styleUrls: ['instance-blocked-domain.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InstanceBlockedDomainDialog implements OnInit {
    protected domain = model('');
    protected reason = model('');

    private messageService = inject(MessagesService);
    private instanceBlockedDomainsService = inject(InstanceBlockedDomainsService);
    private dialogRef = inject(MatDialogRef<InstanceBlockedDomainDialog>);
    private data?: InstanceBlockedDomain = inject(MAT_DIALOG_DATA);

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
                this.messageService.showSuccess('Domain has been updated.');
            } else {
                const newDomain = new InstanceBlockedDomain();
                newDomain.domain = this.domain();
                newDomain.reason = this.reason();

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
