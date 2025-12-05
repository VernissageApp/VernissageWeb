import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injector, NgZone, isDevMode, PLATFORM_ID, inject, provideAppInitializer } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { GlobalErrorHandler } from 'src/app/handlers/global-error-handler';
import { InstanceService } from 'src/app/services/http/instance.service';
import { appInitialization } from './app-initialization';
import { HammerModule } from "@angular/platform-browser";
import { provideAnimations } from '@angular/platform-browser/animations';

import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app.component';
import { PersistenceBrowserService, PersistenceServerService, PersistenceService } from './services/persistance/persistance.service';
import { AuthorizationService } from './services/authorization/authorization.service';
import { PagesModule } from './pages/pages.module';
import { APIInterceptor } from './interceptors/api.interceptor';
import { LoadingService } from './services/common/loading.service';
import { CustomReuseStrategy } from './common/custom-reuse-strategy';

import { MatIconRegistry } from '@angular/material/icon';
import { SettingsService } from './services/http/settings.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';
import { ErrorItemsService } from './services/http/error-items.service';
import { RandomGeneratorService } from './services/common/random-generator.service';
import { CustomScriptsService } from './services/common/custom-scripts.service';
import { CustomStylesService } from './services/common/custom-styles.service';

/** Custom options the configure the tooltip's default show/hide delays. */
export const customTooltipDefaults: MatTooltipDefaultOptions = {
    showDelay: 750,
    hideDelay: 250,
    touchendHideDelay: 1000,
    touchGestures: 'off'
};

@NgModule({
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
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
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: customTooltipDefaults },
        provideAppInitializer(() => {
            const initializerFn = (appInitialization)(inject(AuthorizationService), inject(InstanceService), inject(SettingsService), inject(CustomScriptsService), inject(CustomStylesService));
            return initializerFn();
        }),
        { provide: HTTP_INTERCEPTORS, useClass: APIInterceptor, multi: true },
        {
            provide: PersistenceService,
            useFactory: (platformId: object) => {
                if (isPlatformBrowser(platformId)) {
                    return new PersistenceBrowserService();
                }
                else {
                    return new PersistenceServerService();
                }
            },
            deps: [PLATFORM_ID]
        },
        {
            provide: ErrorHandler, useClass: GlobalErrorHandler, deps: [PLATFORM_ID, Injector, NgZone, AuthorizationService, PersistenceService, LoadingService, ErrorItemsService, RandomGeneratorService]
        },
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideClientHydration(withEventReplay()),
        // The animations are required now only by sat-popover library.
        provideAnimations()
    ]
})
export class AppModule {
    constructor(iconRegistry: MatIconRegistry) {
        iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
      }
}
