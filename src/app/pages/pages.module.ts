import { NgModule } from '@angular/core';

import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';
import { PagesRoutingModule } from './pages-routing.module';
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

@NgModule({
    imports: [
        ComponentsModule,
        PipesModule,
        PagesRoutingModule
    ],
    declarations: [
        HomePage,
        LoginPage,
        LoginCallbackPage,
        PageNotFoundPage,
        AccessForbiddenPage,
        RegisterPage,
        ForgotPasswordPage,
        ResetPasswordPage,
        ConfirmEmailPage,
        AccountPage
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
        RegisterPage,
        ForgotPasswordPage,
        ResetPasswordPage,
        ConfirmEmailPage,
        AccountPage
    ]
})
export class PagesModule { }
