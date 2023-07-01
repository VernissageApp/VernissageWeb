import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ValidationsModule } from '../validators/validations.module';
import { ComponentsModule } from "../components/components.module";

import { ChangePasswordDialog } from "./change-password-dialog/change-password.dialog";

@NgModule({
    declarations: [
        ChangePasswordDialog
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        RouterModule,
        ValidationsModule,
        ComponentsModule
    ],
    exports: [
        ChangePasswordDialog
    ]
})
export class DialogsModule { }
