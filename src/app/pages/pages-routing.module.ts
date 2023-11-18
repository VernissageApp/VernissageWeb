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

const routes: Routes = [
    { path: 'login', component: LoginPage, canActivate: [ loggedOutGuard ] },
    { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [ loggedOutGuard ] },
    { path: 'login-callback', component: LoginCallbackPage, canActivate: [ loggedOutGuard ] },
    { path: 'reset-password', component: ResetPasswordPage, canActivate: [ loggedOutGuard ] },
    { path: 'register', component: RegisterPage, canActivate: [ loggedOutGuard ] },
    { path: 'confirm-email', component: ConfirmEmailPage, canActivate: [ loggedOutGuard ] },
    { path: 'account', component: AccountPage, canActivate: [ authorizationGuard ] },
    { path: 'home', component: HomePage, data: { reuse: true } },
    { path: 'access-forbidden', component: AccessForbiddenPage },
    { path: 'unexpected-error', component: UnexpectedErrorPage },
    { path: 'connection-lost', component: ConnectionLostPage },
    { path: 'page-not-found', component: PageNotFoundPage },
    { path: 'upload', component: UploadPage, canActivate: [ authorizationGuard ] },
    { path: 'search', component: SearchPage, canActivate: [ authorizationGuard ] },
    { path: 'notifications', component: NotificationsPage, canActivate: [ authorizationGuard ] },
    { path: 'invitations', component: InvitationsPage, canActivate: [ authorizationGuard ] },
    { path: 'settings', component: SettingsPage, canActivate: [ authorizationGuard ] },
    { path: 'trending', component: TrendingPage, canActivate: [ authorizationGuard ] },
    { path: 'editors', component: EditorsPage, canActivate: [ authorizationGuard ] },
    { path: 'categories', component: CategoriesPage, canActivate: [ authorizationGuard ] },
    { path: 'preferences', component: PreferencesPage, canActivate: [ authorizationGuard ] },
    { path: ':userName', component: ProfilePage, children: [
        { path: 'following', component: ProfilePage },
        { path: 'followers', component: ProfilePage }
    ]},
    { path: ':userName/:id', component: StatusPage },
    { path: 'statuses/:id', component: StatusPage },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundPage }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
