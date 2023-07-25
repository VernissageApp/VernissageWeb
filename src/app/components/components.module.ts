import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgOptimizedImage } from "@angular/common";
import { UploadPhotoComponent } from './widgets/upload-photo/upload-photo.component';

import { ValidationsModule } from '../validators/validations.module';
import { HeaderComponent } from './core/header/header.component';
import { PasswordComponent } from './widgets/password/password.component';
import { AngularMaterialModule } from './angular-material.module';

@NgModule({
    declarations: [
        HeaderComponent,
        PasswordComponent,
        UploadPhotoComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule,
        ValidationsModule,
        NgOptimizedImage
    ],
    exports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule,
        ValidationsModule,
        HeaderComponent,
        PasswordComponent,
        NgOptimizedImage,
        UploadPhotoComponent
    ]
})
export class ComponentsModule { }
