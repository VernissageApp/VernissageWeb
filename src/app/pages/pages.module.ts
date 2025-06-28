import { NgModule } from '@angular/core';
import { ConnectionLostPage } from 'src/app/pages/errors/connection-lost/connection-lost.page';
import { UnexpectedErrorPage } from 'src/app/pages/errors/unexpected-error/unexpected-error.page';
import { ProfilePage } from 'src/app/pages/profile/profile.page';
import { UploadPage } from 'src/app/pages/upload/upload.page';

import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';
import { PagesRoutingModule } from './pages-routing.module';
import { DialogsModule } from "../dialogs/dialogs.module";

import { HomePage } from './home/home.page';
import { PageNotFoundPage } from './errors/page-not-found/page-not-found.page';
import { AccessForbiddenPage } from './errors/access-forbidden/access-forbidden.page';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';
import { ResetPasswordPage } from './reset-password/reset-password.page';
import { ConfirmEmailPage } from './confirm-email/confirm-email.page';
import { AccountPage } from './account/account.page';
import { LoginCallbackPage } from "./login-callback/login-callback.page";
import { SearchPage } from './search/search.page';
import { StatusPage } from './status/status.page';
import { NotificationsPage } from './notifications/notifications.page';
import { InvitationsPage } from './invitations/invitations.page';
import { SettingsPage } from './settings/settings.page';
import { TrendingPage } from './trending/trending.page';
import { EditorsPage } from './editors/editors.page';
import { CategoriesPage } from './categories/categories.page';
import { PreferencesPage } from './preferences/preferences.page';
import { ReportsPage } from './reports/reports.page';
import { UsersPage } from './users/users.page';
import { HashtagPage } from './hashtag/hashtag.page';
import { CategoryPage } from './category/category.page';
import { SupportPage } from './support/support.page';
import { TermsPage } from './terms/terms.page';
import { PrivacyPage } from './privacy/privacy.page';
import { BookmarksPage } from './bookmarks/bookmarks.page';
import { FavouritesPage } from './favourites/favourites.page';
import { ErrorItemsPage } from './error-items/error-items.page';
import { ArticlesPage } from './articles/articles.page';
import { NewsPage } from './news/news.page';
import { EditBusinessCardPage } from './edit-business-card/edit-business-card.page';
import { SharedCardsPage } from './shared-cards/shared-cards.page';
import { SharedCardPage } from './shared-card/shared-card.page';
import { SharedCardPublicPage } from './shared-card-public/shared-card-public.page';
import { ArticleEditPage } from './article-edit/article-edit.page';
import { NewsPreviewPage } from './news-preview/news-preview.page';
import { FrequentlyAskedQuestionsPage } from './frequently-asked-questions/frequently-asked-questions.page';

@NgModule({
    imports: [
        ComponentsModule,
        DialogsModule,
        PipesModule,
        PagesRoutingModule
    ],
    declarations: [
        HomePage,
        LoginPage,
        LoginCallbackPage,
        PageNotFoundPage,
        UnexpectedErrorPage,
        AccessForbiddenPage,
        ConnectionLostPage,
        RegisterPage,
        ForgotPasswordPage,
        ResetPasswordPage,
        ConfirmEmailPage,
        AccountPage,
        ProfilePage,
        UploadPage,
        SearchPage,
        StatusPage,
        NotificationsPage,
        InvitationsPage,
        SettingsPage,
        TrendingPage,
        EditorsPage,
        CategoriesPage,
        PreferencesPage,
        ReportsPage,
        UsersPage,
        HashtagPage,
        CategoryPage,
        SupportPage,
        TermsPage,
        PrivacyPage,
        BookmarksPage,
        FavouritesPage,
        ErrorItemsPage,
        ArticlesPage,
        ArticleEditPage,
        NewsPage,
        NewsPreviewPage,
        EditBusinessCardPage,
        SharedCardsPage,
        SharedCardPage,
        SharedCardPublicPage,
        FrequentlyAskedQuestionsPage
    ],
    exports: [
        ComponentsModule,
        PipesModule,
        PagesRoutingModule,
        HomePage,
        LoginPage,
        LoginCallbackPage,
        PageNotFoundPage,
        AccessForbiddenPage,
        ConnectionLostPage,
        UnexpectedErrorPage,
        RegisterPage,
        ForgotPasswordPage,
        ResetPasswordPage,
        ConfirmEmailPage,
        AccountPage,
        ProfilePage,
        UploadPage,
        SearchPage,
        NotificationsPage,
        InvitationsPage,
        SettingsPage,
        TrendingPage,
        EditorsPage,
        CategoriesPage,
        PreferencesPage,
        ReportsPage,
        UsersPage,
        HashtagPage,
        CategoryPage,
        SupportPage,
        TermsPage,
        PrivacyPage,
        BookmarksPage,
        FavouritesPage,
        ErrorItemsPage,
        ArticlesPage,
        ArticleEditPage,
        NewsPage,
        NewsPreviewPage,
        EditBusinessCardPage,
        SharedCardsPage,
        SharedCardPage,
        SharedCardPublicPage,
        FrequentlyAskedQuestionsPage
    ]
})
export class PagesModule { }
