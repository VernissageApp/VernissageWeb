import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserBlockedDomainsService } from 'src/app/services/http/user-blocked-domains.service';
import { UserBlockedDomainDialogEntity } from './user-blocked-domain-dialog-entity';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-user-blocked-domain-dialog',
    templateUrl: 'user-blocked-domain.dialog.html',
    styleUrls: ['user-blocked-domain.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
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
