import { ApplicationConfig, Injectable, inject, importProvidersFrom, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { from, Observable } from 'rxjs';

import { appConfig } from './app.config';
import { I18N_ASSETS_PATH } from './common/i18n-assets-path.token';
import { SsrCookieService } from './services/common/ssr-cookie.service';
import { WindowService } from './services/common/window.service';
import { SsrAccessTokenService } from './services/authorization/ssr-access-token.service';

const jwtOptionsFactory = (cookieService: SsrCookieService, windowService: WindowService, ssrAccessTokenService: SsrAccessTokenService) => ({
    tokenGetter: () => ssrAccessTokenService.get() ?? cookieService.get('access-token'),
    allowedDomains: [windowService.apiService(), 'localhost'],
});

@Injectable()
class ServerTranslateLoader implements TranslateLoader {
    private i18nAssetsPath = inject(I18N_ASSETS_PATH, { optional: true });

    getTranslation(lang: string): Observable<TranslationObject> {
        const i18nAssetsPath = this.i18nAssetsPath ?? join(process.cwd(), 'src/assets/i18n');
        const filePath = join(i18nAssetsPath, `${lang}.lang`);

        return from(readFile(filePath, 'utf8').then((content) => JSON.parse(content) as TranslationObject));
    }
}

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        importProvidersFrom(JwtModule.forRoot({
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                useFactory: jwtOptionsFactory,
                deps: [SsrCookieService, WindowService, SsrAccessTokenService],
            },
        })),
        { provide: TranslateLoader, useClass: ServerTranslateLoader },
    ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
