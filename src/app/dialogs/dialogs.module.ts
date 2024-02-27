import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
        DisableTwoFactorTokenDialog
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        ValidationsModule,
        ComponentsModule
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
        DisableTwoFactorTokenDialog
    ]
})
export class DialogsModule { }
