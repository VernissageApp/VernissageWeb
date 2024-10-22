import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler, Injector, NgZone, isDevMode, PLATFORM_ID } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { GlobalErrorHandler } from 'src/app/handlers/global-error-handler';
import { InstanceService } from 'src/app/services/http/instance.service';
import { appInitialization } from './app-initialization';

import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app.component';
import { PersistanceBrowserService, PersistanceServerService, PersistanceService } from './services/persistance/persistance.service';
import { AuthorizationService } from './services/authorization/authorization.service';
import { PagesModule } from './pages/pages.module';
import { APIInterceptor } from './interceptors/api.interceptor';
import { LoadingService } from './services/common/loading.service';
import { CustomReuseStrategy } from './common/custom-reuse-strategy';
import { HammerModule } from "../../node_modules/@angular/platform-browser";
import { MatIconRegistry } from '@angular/material/icon';
import { SettingsService } from './services/http/settings.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';
import { ErrorItemsService } from './services/http/error-items.service';
import { RandomGeneratorService } from './services/common/random-generator.service';

const httpInterceptor = (platformId: object, authorizationService: AuthorizationService) => 
    new APIInterceptor(platformId, authorizationService);

@NgModule({
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HammerModule,
        PagesModule,
        ServiceWorkerModule.register('service-worker.js', {
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
            deps: [PLATFORM_ID, AuthorizationService],
            multi: true
        },
        {
            provide: PersistanceService,
            useFactory: (platformId: object) => {
                if (isPlatformBrowser(platformId)) {
                    return new PersistanceBrowserService();
                }
                else {
                    return new PersistanceServerService();
                }
            },
            deps: [PLATFORM_ID]
        },
        {
            provide: ErrorHandler, useClass: GlobalErrorHandler, deps: [PLATFORM_ID, Injector, NgZone, AuthorizationService, PersistanceService, LoadingService, ErrorItemsService, RandomGeneratorService]
        },
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideClientHydration()
    ]
})
export class AppModule {
    constructor(iconRegistry: MatIconRegistry) {
        iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
      }
}
