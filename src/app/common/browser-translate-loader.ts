import { inject, Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

@Injectable()
export class BrowserTranslateLoader implements TranslateLoader {
    private readonly httpClient = new HttpClient(inject(HttpBackend));

    getTranslation(lang: string): Observable<TranslationObject> {
        return this.httpClient.get(`./assets/i18n/${lang}.lang`, {
            headers: {
                Accept: 'text/plain, */*',
            },
            responseType: 'text',
        }).pipe(
            map((content) => JSON.parse(content) as TranslationObject)
        );
    }
}
