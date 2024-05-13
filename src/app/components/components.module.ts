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
import { CategoryGalleryComponent } from './widgets/category-gallery/category-gallery.component';
import { BlurhashImageComponent } from './widgets/blurhash-image/blurhash-image.component';
import { ImageComponent } from './widgets/image/image.component';
import { DirectivesModule } from '../directives/directive.module';
import { FooterComponent } from './core/footer/footer.component';
import { GeneralSettingsComponent } from './widgets/general-settings/general-settings.component';
import { DomainBlocksComponent } from './widgets/domain-blocks/domain-blocks.component';
import { InstanceRulesComponent } from './widgets/instance-rules/instance-rules.component';

@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent,
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
        HashtagGalleryComponent,
        CategoryGalleryComponent,
        BlurhashImageComponent,
        ImageComponent,
        GeneralSettingsComponent,
        DomainBlocksComponent,
        InstanceRulesComponent
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
        NgOptimizedImage,
        DirectivesModule
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
        FooterComponent,
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
        HashtagGalleryComponent,
        CategoryGalleryComponent,
        BlurhashImageComponent,
        ImageComponent,
        GeneralSettingsComponent,
        DomainBlocksComponent,
        InstanceRulesComponent,
        DirectivesModule
    ]
})
export class ComponentsModule { }
