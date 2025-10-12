import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DeleteAccountDialog } from 'src/app/dialogs/delete-account-dialog/delete-account.dialog';
import { ValidationsModule } from '../validators/validations.module';
import { ComponentsModule } from '../components/components.module';

import { ChangePasswordDialog } from './change-password-dialog/change-password.dialog';
import { ChangeEmailDialog } from './change-email-dialog/change-email.dialog';
import { MuteAccountDialog } from './mute-account-dialog/mute-account.dialog';
import { ReportDialog } from './report-dialog/report.dialog';
import { ReportDetailsDialog } from './report-details-dialog/report-details.dialog';
import { UserRolesDialog } from './user-roles-dialog/user-roles.dialog';
import { DeleteStatusDialog } from './delete-status-dialog/delete-status.dialog';
import { UsersDialog } from './users-dialog/users.dialog';
import { EnableTwoFactorTokenDialog } from './enable-two-factor-token/enable-two-factor-token.dialog';
import { DisableTwoFactorTokenDialog } from './disable-two-factor-token/disable-two-factor-token.dialog';
import { ContentWarningDialog } from './content-warning-dialog/content-warning.dialog';
import { InstanceBlockedDomainDialog } from './instance-blocked-domain-dialog/instance-blocked-domain.dialog';
import { ProfileCodeDialog } from './profile-code-dialog/profile-code.dialog';
import { NotificationSettingsDialog } from './notification-settings-dialog/notification-settings.dialog';
import { InstanceRuleDialog } from './instance-rule-dialog/instance-rule.dialog';
import { ConfirmationDialog } from './confirmation-dialog/confirmation.dialog';
import { CreateAliasDialog } from './create-alias-dialog/create-alias.dialog';
import { StatusTextDialog } from './status-text-template-dialog/status-text-template.dialog';
import { CategoryDialog } from './category-dialog/category.dialog';
import { CategoryHashtagItemComponent } from './category-dialog/category-hashtag-item.component';
import { FollowingImportAccountsDialog } from './following-import-accounts-dialog/following-import-accounts.dialog';
import { ShareBusinessCardDialog } from './share-business-card-dialog/share-business-card.dialog';
import { UpdateSharedBusinessCardDialog } from './update-shared-business-card/update-shared-business-card.dialog';
import { ErrorItemDialog } from './error-item-dialog/error-item.dialog';
import { StatusEventErrorMessageDialog } from './status-event-error-message-dialog/status-event-error-message.dialog';
import { LicenseDialog } from './license-dialog/license.dialog';

@NgModule({
    declarations: [
        ChangePasswordDialog,
        ChangeEmailDialog,
        DeleteAccountDialog,
        MuteAccountDialog,
        ReportDialog,
        ReportDetailsDialog,
        UserRolesDialog,
        DeleteStatusDialog,
        UsersDialog,
        EnableTwoFactorTokenDialog,
        DisableTwoFactorTokenDialog,
        ContentWarningDialog,
        InstanceBlockedDomainDialog,
        ProfileCodeDialog,
        NotificationSettingsDialog,
        InstanceRuleDialog,
        ConfirmationDialog,
        CreateAliasDialog,
        StatusTextDialog,
        CategoryDialog,
        FollowingImportAccountsDialog,
        ShareBusinessCardDialog,
        UpdateSharedBusinessCardDialog,
        ErrorItemDialog,
        StatusEventErrorMessageDialog,
        LicenseDialog,
        CategoryHashtagItemComponent
    ],
    exports: [
        ChangePasswordDialog,
        ChangeEmailDialog,
        DeleteAccountDialog,
        MuteAccountDialog,
        ReportDialog,
        ReportDetailsDialog,
        UserRolesDialog,
        DeleteStatusDialog,
        UsersDialog,
        EnableTwoFactorTokenDialog,
        DisableTwoFactorTokenDialog,
        ContentWarningDialog,
        InstanceBlockedDomainDialog,
        ProfileCodeDialog,
        NotificationSettingsDialog,
        InstanceRuleDialog,
        ConfirmationDialog,
        CreateAliasDialog,
        StatusTextDialog,
        CategoryDialog,
        ShareBusinessCardDialog,
        UpdateSharedBusinessCardDialog,
        ErrorItemDialog,
        FollowingImportAccountsDialog,
        StatusEventErrorMessageDialog,
        LicenseDialog
    ], 
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ValidationsModule,
        ComponentsModule
    ],
    providers: [
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
    ]
})
export class DialogsModule { }
