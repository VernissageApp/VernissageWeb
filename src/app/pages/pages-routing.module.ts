import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionLostPage } from 'src/app/pages/errors/connection-lost/connection-lost.page';
import { UnexpectedErrorPage } from 'src/app/pages/errors/unexpected-error/unexpected-error.page';
import { ProfilePage } from 'src/app/pages/profile/profile.page';
import { UploadPage } from 'src/app/pages/upload/upload.page';

import { loggedOutGuard } from '../services/authorization/logged-out-guard.service';
import { authorizationGuard } from '../services/authorization/authorization-guard.service';

import { HomePage } from './home/home.page';
import { AccessForbiddenPage } from './errors/access-forbidden/access-forbidden.page';
import { PageNotFoundPage } from './errors/page-not-found/page-not-found.page';
import { LoginPage } from './login/login.page';
import { LoginCallbackPage } from './login-callback/login-callback.page';
import { RegisterPage } from './register/register.page';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';
import { ResetPasswordPage } from './reset-password/reset-password.page';
import { ConfirmEmailPage } from './confirm-email/confirm-email.page';
import { AccountPage } from './account/account.page';
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
import { ArticlePage } from './article/article.page';
import { NewsPage } from './news/news.page';

const routes: Routes = [
    { path: 'login', component: LoginPage, canActivate: [ loggedOutGuard ], title: 'Vernissage - Login' },
    { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [ loggedOutGuard ], title: 'Vernissage - Forgot password' },
    { path: 'login-callback', component: LoginCallbackPage, canActivate: [ loggedOutGuard ] },
    { path: 'reset-password', component: ResetPasswordPage, canActivate: [ loggedOutGuard ], title: 'Vernissage - Reset password' },
    { path: 'register', component: RegisterPage, canActivate: [ loggedOutGuard ], title: 'Vernissage - Register' },
    { path: 'confirm-email', component: ConfirmEmailPage, title: 'Vernissage - Confirm email' },
    { path: 'account', component: AccountPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Account' },
    { path: 'home', component: HomePage, data: { reuse: true }, title: 'Vernissage - Home timeline' },
    { path: 'access-forbidden', component: AccessForbiddenPage, title: 'Vernissage - Access forbidden' },
    { path: 'unexpected-error', component: UnexpectedErrorPage, title: 'Vernissage - Unexpected error' },
    { path: 'connection-lost', component: ConnectionLostPage, title: 'Vernissage - Connection lost' },
    { path: 'page-not-found', component: PageNotFoundPage, title: 'Vernissage - Page not found' },
    { path: 'upload', component: UploadPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Upload images' },
    { path: 'search', component: SearchPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Search' },
    { path: 'notifications', component: NotificationsPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Notifications' },
    { path: 'invitations', component: InvitationsPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Invitations' },
    { path: 'settings', component: SettingsPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Settings' },
    { path: 'trending', component: TrendingPage, data: { reuse: true }, title: 'Vernissage - Trending' },
    { path: 'editors', component: EditorsPage, data: { reuse: true }, title: 'Vernissage - Editor\'s choice' },
    { path: 'categories', component: CategoriesPage, data: { reuse: true }, title: 'Vernissage - Categories' },
    { path: 'preferences', component: PreferencesPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Preferences' },
    { path: 'reports', component: ReportsPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Reports' },
    { path: 'tags/:tag', component: HashtagPage, data: { reuse: true }, title: 'Vernissage - Tags' },
    { path: 'categories/:category', component: CategoryPage, data: { reuse: true }, title: 'Vernissage - Categories' },
    { path: 'support', component: SupportPage, title: 'Vernissage - Support' },
    { path: 'terms', component: TermsPage, title: 'Vernissage - Terms' },
    { path: 'privacy', component: PrivacyPage, title: 'Vernissage - Privacy' },
    { path: 'bookmarks', component: BookmarksPage, data: { reuse: true }, title: 'Vernissage - Bookmarks' },
    { path: 'favourites', component: FavouritesPage, data: { reuse: true }, title: 'Vernissage - Favourites' },
    { path: 'users', component: UsersPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Users' },
    { path: 'articles', component: ArticlesPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Articles' },
    { path: 'articles/create', component: ArticlePage, canActivate: [ authorizationGuard ], title: 'Vernissage - Create article' },
    { path: 'articles/:id', component: ArticlePage, canActivate: [ authorizationGuard ], title: 'Vernissage - Edit article' },
    { path: 'news', component: NewsPage, canActivate: [ authorizationGuard ], title: 'Vernissage - News' },
    { path: 'error-items', component: ErrorItemsPage, canActivate: [ authorizationGuard ], title: 'Vernissage - Errors' },
    { path: 'actors/:userName', component: ProfilePage, data: { reuse: true }, children: [
        { path: 'posts', component: ProfilePage },
        { path: 'following', component: ProfilePage },
        { path: 'followers', component: ProfilePage }
    ]},
    { path: ':userName', component: ProfilePage, data: { reuse: true }, children: [
        { path: 'posts', component: ProfilePage },
        { path: 'following', component: ProfilePage },
        { path: 'followers', component: ProfilePage }
    ]},
    { path: ':userName/:id', component: StatusPage },
    { path: 'statuses/:id', component: StatusPage },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundPage }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', enableViewTransitions: true })],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
