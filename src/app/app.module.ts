import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler, Injector, NgZone } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { GlobalErrorHandler } from 'src/app/handlers/global-error-handler';
import { InstanceService } from 'src/app/services/http/instance.service';
import { appInitialization } from './app-initialization';

import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { PersistanceService } from './services/persistance/persistance.service';
import { AuthorizationService } from './services/authorization/authorization.service';
import { PagesModule } from './pages/pages.module';
import { APIInterceptor } from './interceptors/api.interceptor';
// import { NgxCaptchaModule } from 'ngx-captcha';

const jwtOptionsFactory = (persistanceService: PersistanceService) => {
    return {
        tokenGetter: () => persistanceService.getAccessToken(),
        allowedDomains: [environment.apiService]
    };
};

const httpInterceptor = (router: Router) => new APIInterceptor(router);

@NgModule({
    declarations: [
    AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        JwtModule.forRoot({
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                useFactory: jwtOptionsFactory,
                deps: [PersistanceService]
            }
        }),
        // NgxCaptchaModule,
        PagesModule
    ],
    providers: [
        { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'check' } as MatCheckboxDefaultOptions },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitialization,
            deps: [AuthorizationService, InstanceService],
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useFactory: httpInterceptor,
            deps: [Router],
            multi: true
        },
        {
            provide: ErrorHandler, useClass: GlobalErrorHandler, deps: [Injector, NgZone, AuthorizationService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
