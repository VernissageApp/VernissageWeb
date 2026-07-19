import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import {
    ApplicationConfig,
    ErrorHandler,
    Injector,
    NgZone,
    PLATFORM_ID,
    inject,
    isDevMode,
    provideAppInitializer,
    provideZoneChangeDetection,
} from '@angular/core';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    RouteReuseStrategy,
    TitleStrategy,
    provideRouter,
    withInMemoryScrolling,
    withViewTransitions,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateCompiler, provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';

import { appInitialization } from './app-initialization';
import { BrowserTranslateLoader } from './common/browser-translate-loader';
import { CustomReuseStrategy } from './common/custom-reuse-strategy';
import { LocalizedTitleStrategy } from './common/localized-title-strategy';
import { GlobalErrorHandler } from './handlers/global-error-handler';
import { apiInterceptor } from './interceptors/api.interceptor';
import { routes } from './pages/app.routes';
import { AuthorizationService } from './services/authorization/authorization.service';
import { CustomScriptsService } from './services/common/custom-scripts.service';
import { CustomStylesService } from './services/common/custom-styles.service';
import { ErrorParserService } from './services/common/error-parser.service';
import { LanguageService } from './services/common/language.service';
import { LoadingService } from './services/common/loading.service';
import { RandomGeneratorService } from './services/common/random-generator.service';
import { ErrorItemsService } from './services/http/error-items.service';
import { InstanceService } from './services/http/instance.service';
import { SettingsService } from './services/http/settings.service';
import {
    PersistenceBrowserService,
    PersistenceServerService,
    PersistenceService,
} from './services/persistance/persistance.service';

const customTooltipDefaults: MatTooltipDefaultOptions = {
    showDelay: 750,
    hideDelay: 250,
    touchendHideDelay: 1000,
    touchGestures: 'off',
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection(),
        provideRouter(
            routes,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
            withViewTransitions(),
        ),
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: TitleStrategy, useClass: LocalizedTitleStrategy },
        { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'check' } as MatCheckboxDefaultOptions },
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: customTooltipDefaults },
        provideNativeDateAdapter(),
        provideTranslateService({
            fallbackLang: 'en-us',
            compiler: provideTranslateCompiler(TranslateMessageFormatCompiler),
            loader: provideTranslateLoader(BrowserTranslateLoader),
        }),
        provideAppInitializer(() => {
            const initializerFn = appInitialization(
                inject(AuthorizationService),
                inject(InstanceService),
                inject(SettingsService),
                inject(CustomScriptsService),
                inject(CustomStylesService),
                inject(LanguageService),
            );
            return initializerFn();
        }),
        provideAppInitializer(() => {
            inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
        }),
        {
            provide: PersistenceService,
            useFactory: (platformId: object) => isPlatformBrowser(platformId)
                ? new PersistenceBrowserService()
                : new PersistenceServerService(),
            deps: [PLATFORM_ID],
        },
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
            deps: [
                PLATFORM_ID,
                Injector,
                NgZone,
                AuthorizationService,
                PersistenceService,
                LoadingService,
                ErrorItemsService,
                RandomGeneratorService,
                ErrorParserService,
            ],
        },
        // JwtModule registers its server-side JwtInterceptor through HTTP_INTERCEPTORS.
        provideHttpClient(withInterceptors([apiInterceptor]), withInterceptorsFromDi()),
        provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
        // The animations are required now only by ng-gallery library.
        provideAnimations(),
        provideServiceWorker('service-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
};
