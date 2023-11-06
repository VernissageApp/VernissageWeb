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
        NotificationsPage
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
        NotificationsPage
    ]
})
export class PagesModule { }
