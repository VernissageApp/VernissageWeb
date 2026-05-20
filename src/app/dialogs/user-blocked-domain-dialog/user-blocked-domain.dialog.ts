import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserBlockedDomainsService } from 'src/app/services/http/user-blocked-domains.service';
import { UserBlockedDomainDialogEntity } from './user-blocked-domain-dialog-entity';

@Component({
    selector: 'app-user-blocked-domain-dialog',
    templateUrl: 'user-blocked-domain.dialog.html',
    styleUrls: ['user-blocked-domain.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserBlockedDomainDialog implements OnInit {
    protected domain = model('');
    protected reason = model('');
    protected showLegend = signal(false);
    protected title = signal('');

    private messageService = inject(MessagesService);
    private userBlockedDomainsService = inject(UserBlockedDomainsService);
    private dialogRef = inject(MatDialogRef<UserBlockedDomainDialog>);
    private data?: UserBlockedDomainDialogEntity = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);

    ngOnInit(): void {
        if (this.data) {
            this.domain.set(this.data.entity.domain);
            this.reason.set(this.data.entity.reason ?? '');
            this.showLegend.set(this.data.showLegend);
            this.title.set(this.data.title);
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.entity.id) {
                this.data.entity.domain = this.domain();
                this.data.entity.reason = this.reason();

                await this.userBlockedDomainsService.update(this.data.entity.id, this.data.entity);
                this.messageService.showSuccess(this.translateService.instant('dialogs.userBlockedDomain.messages.blockedDomainHasBeenUpdated'));
            } else {
                const newDomain = new InstanceBlockedDomain();
                newDomain.domain = this.domain();
                newDomain.reason = this.reason();

                await this.userBlockedDomainsService.create(newDomain);
                this.messageService.showSuccess(this.translateService.instant('dialogs.userBlockedDomain.messages.domainHasBeenBlocked'));
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
