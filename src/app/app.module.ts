import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler, Injector, NgZone, isDevMode } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { GlobalErrorHandler } from 'src/app/handlers/global-error-handler';
import { InstanceService } from 'src/app/services/http/instance.service';
import { appInitialization } from './app-initialization';

import { RouteReuseStrategy, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { PersistanceService } from './services/persistance/persistance.service';
import { AuthorizationService } from './services/authorization/authorization.service';
import { PagesModule } from './pages/pages.module';
import { APIInterceptor } from './interceptors/api.interceptor';
import { LoadingService } from './services/common/loading.service';
import { WindowService } from './services/common/window.service';
import { CustomReuseStrategy } from './common/custom-reuse-strategy';
import { HammerModule } from "../../node_modules/@angular/platform-browser";
import { MatIconRegistry } from '@angular/material/icon';
import { SettingsService } from './services/http/settings.service';
import { ServiceWorkerModule } from '@angular/service-worker';
// import { NgxCaptchaModule } from 'ngx-captcha';

const jwtOptionsFactory = (persistanceService: PersistanceService, windowService: WindowService) => {
    return {
        tokenGetter: () => persistanceService.getAccessToken(),
        allowedDomains: [windowService.apiService()]
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
                deps: [PersistanceService, WindowService]
            }
        }),
        // NgxCaptchaModule,
        HammerModule,
        PagesModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'check' } as MatCheckboxDefaultOptions },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitialization,
            deps: [AuthorizationService, InstanceService, SettingsService],
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useFactory: httpInterceptor,
            deps: [Router],
            multi: true
        },
        {
            provide: ErrorHandler, useClass: GlobalErrorHandler, deps: [Injector, NgZone, AuthorizationService, LoadingService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(iconRegistry: MatIconRegistry) {
        iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
      }
}
