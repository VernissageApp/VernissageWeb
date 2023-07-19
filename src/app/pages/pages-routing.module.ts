import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionLostPage } from 'src/app/pages/errors/connection-lost/connection-lost.page';
import { UnexpectedErrorPage } from 'src/app/pages/errors/unexpected-error/unexpected-error.page';
import { ProfilePage } from 'src/app/pages/profile/profile.page';
import { UploadPage } from 'src/app/pages/upload/upload.page';

import { LoggedOutGuardService } from '../services/authorization/logged-out-guard.service';
import { AuthorizationGuardService } from '../services/authorization/authorization-guard.service';
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

const routes: Routes = [
    { path: 'login', component: LoginPage, canActivate: [ LoggedOutGuardService ] },
    { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [ LoggedOutGuardService ] },
    { path: 'login-callback', component: LoginCallbackPage, canActivate: [ LoggedOutGuardService ] },
    { path: 'reset-password', component: ResetPasswordPage, canActivate: [ LoggedOutGuardService ] },
    { path: 'register', component: RegisterPage, canActivate: [ LoggedOutGuardService ] },
    { path: 'confirm-email', component: ConfirmEmailPage, canActivate: [ LoggedOutGuardService ] },
    { path: 'account', component: AccountPage, canActivate: [ AuthorizationGuardService ] },
    { path: 'home', component: HomePage },
    { path: 'access-forbidden', component: AccessForbiddenPage },
    { path: 'unexpected-error', component: UnexpectedErrorPage },
    { path: 'connection-lost', component: ConnectionLostPage },
    { path: 'upload', component: UploadPage, canActivate: [ AuthorizationGuardService ] },
    { path: ':userName', component: ProfilePage },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: PageNotFoundPage }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
