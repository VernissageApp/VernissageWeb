import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
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
import { CategoryGalleryItemComponent } from './widgets/category-gallery-item/category-gallery-item.component';
import { HashtagGalleryItemComponent } from './widgets/hashtag-gallery-item/hashtag-gallery-item.component';
import { UsersGalleryItemComponent } from './widgets/users-gallery-item/users-gallery-item.component';
import { UserPopoverComponent } from './widgets/user-popover/user-popover.component';
import { HashtagsSearchComponent } from './widgets/hashtags-search/hashtags-search.component';
import { StatusesSearchComponent } from './widgets/statuses-search/statuses-search.component';
import { StatusPropertiesComponent } from './widgets/status-properties/status-properties.component';
import { UserSelectorComponent } from './widgets/user-selector/user-selector.component';
import { HomeSigninComponent } from './widgets/home-signin/home-signin.component';
import { HomeSignoutComponent } from './widgets/home-signout/home-signout.component';
import { CategoryListComponent } from './widgets/category-list/category-list.component';
import { ArticleInlineComponent } from './widgets/article-inline/article-inline.component';
import { BusinessCardComponent } from './widgets/business-card/business-card.component';
import { LicenseListComponent } from './widgets/license-list/license-list.component';

@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent,
        PasswordComponent,
        UploadPhotoComponent,
        UserCardComponent,
        UserPopoverComponent,
        UserSelectorComponent,
        UsersCardComponent,
        FollowButtonsSectionComponent,
        GalleryComponent,
        MiniUserCardComponent,
        CommentReplyComponent,
        AvatarComponent,
        UsersGalleryComponent,
        UsersGalleryItemComponent,
        HashtagGalleryComponent,
        HashtagGalleryItemComponent,
        CategoryGalleryComponent,
        CategoryGalleryItemComponent,
        BlurhashImageComponent,
        ImageComponent,
        GeneralSettingsComponent,
        DomainBlocksComponent,
        InstanceRulesComponent,
        HashtagsSearchComponent,
        StatusesSearchComponent,
        StatusPropertiesComponent,
        HomeSigninComponent,
        HomeSignoutComponent,
        CategoryListComponent,
        ArticleInlineComponent,
        BusinessCardComponent,
        LicenseListComponent
    ],
    exports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
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
        UserSelectorComponent,
        FollowButtonsSectionComponent,
        GalleryComponent,
        MiniUserCardComponent,
        CommentReplyComponent,
        AvatarComponent,
        UsersGalleryComponent,
        HashtagGalleryComponent,
        HashtagGalleryItemComponent,
        CategoryGalleryComponent,
        BlurhashImageComponent,
        ImageComponent,
        GeneralSettingsComponent,
        DomainBlocksComponent,
        InstanceRulesComponent,
        HashtagsSearchComponent,
        StatusesSearchComponent,
        StatusPropertiesComponent,
        HomeSigninComponent,
        HomeSignoutComponent,
        CategoryListComponent,
        ArticleInlineComponent,
        BusinessCardComponent,
        LicenseListComponent,
        DirectivesModule
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule,
        ValidationsModule,
        NgOptimizedImage,
        DirectivesModule
    ],
    providers: [
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
    ]})
export class ComponentsModule { }
