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
import { UsersCardComponent } from './widgets/users-card/users-card.component';
import { FollowButtonsSectionComponent } from './widgets/follow-buttons-section/follow-buttons-section.component';
import { GalleryComponent } from './widgets/gallery/gallery.component';
import { UserCardComponent } from './widgets/user-card/user-card.component';
import { MiniUserCardComponent } from './widgets/mini-user-card/mini-user-card.component';
import { CommentReplyComponent } from './widgets/comment-reply/comment-reply.component';
import { AvatarComponent } from './widgets/avatar/avatar.component';
import { UsersGalleryComponent } from './widgets/users-gallery/users-gallery.component';
import { HashtagGalleryComponent } from './widgets/hashtag-gallery/hashtag-gallery.component';

@NgModule({
    declarations: [
        HeaderComponent,
        PasswordComponent,
        UploadPhotoComponent,
        UserCardComponent,
        UsersCardComponent,
        FollowButtonsSectionComponent,
        GalleryComponent,
        MiniUserCardComponent,
        CommentReplyComponent,
        AvatarComponent,
        UsersGalleryComponent,
        HashtagGalleryComponent
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
        UploadPhotoComponent,
        UsersCardComponent,
        UserCardComponent,
        FollowButtonsSectionComponent,
        GalleryComponent,
        MiniUserCardComponent,
        CommentReplyComponent,
        AvatarComponent,
        UsersGalleryComponent,
        HashtagGalleryComponent
    ]
})
export class ComponentsModule { }
