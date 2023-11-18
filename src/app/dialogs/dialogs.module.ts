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

@NgModule({
    declarations: [
        ChangePasswordDialog,
        ChangeEmailDialog,
        DeleteAccountDialog,
        MuteAccountDialog
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
        MuteAccountDialog
    ]
})
export class DialogsModule { }
