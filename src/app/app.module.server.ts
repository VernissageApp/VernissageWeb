import { inject, Injectable, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { WindowService } from './services/common/window.service';
import { SsrCookieService } from './services/common/ssr-cookie.service';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { I18N_ASSETS_PATH } from './common/i18n-assets-path.token';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { from, Observable } from 'rxjs';

const jwtOptionsFactory = (cookieService: SsrCookieService, windowService: WindowService) => {
    return {
        tokenGetter: () => {
            return cookieService.get('access-token');
        },
        allowedDomains: [windowService.apiService(), 'localhost']
    };
};

@Injectable()
class ServerTranslateLoader implements TranslateLoader {
    private i18nAssetsPath = inject(I18N_ASSETS_PATH, { optional: true });

    getTranslation(lang: string): Observable<TranslationObject> {
        const i18nAssetsPath = this.i18nAssetsPath ?? join(process.cwd(), 'src/assets/i18n');
        const filePath = join(i18nAssetsPath, `${lang}.json`);

        return from(readFile(filePath, 'utf8').then((content) => JSON.parse(content) as TranslationObject));
    }
}

@NgModule({
    imports: [
        AppModule,
        ServerModule,
        JwtModule.forRoot({
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                useFactory: jwtOptionsFactory,
                deps: [SsrCookieService, WindowService],
            }
        }),
    ],
    providers: [
        { provide: TranslateLoader, useClass: ServerTranslateLoader },
    ],
    bootstrap: [AppComponent],
})
export class AppServerModule {}
