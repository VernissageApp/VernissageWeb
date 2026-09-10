import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthorizationService } from '../services/authorization/authorization.service';
import { LanguageService } from '../services/common/language.service';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const authorizationService = inject(AuthorizationService);
    const languageService = inject(LanguageService);

    let authorizedRequest = request.clone({
        withCredentials: true,
        setHeaders: {
            'X-XSRF-TOKEN': authorizationService.getXsrfToken(),
            'Accept-Language': languageService.getAcceptLanguage(),
        },
    });

    // Safari can drop the contents of disk-backed files when a multipart request is forwarded
    // through a service worker. Let the browser send FormData requests directly to the network.
    if (isBrowser && request.body instanceof FormData) {
        authorizedRequest = authorizedRequest.clone({
            params: authorizedRequest.params.set('ngsw-bypass', 'true'),
        });
    }

    // Executing original request.
    return next(authorizedRequest).pipe(catchError(error => {
        // In case of unauthorized error we can try to refresh access tokens.
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized && isBrowser) {
            // Sending refresh token.
            return from(authorizationService.refreshAccessToken()).pipe(
                switchMap(result => {
                    if (result) {
                        // Sending same request once again when refresh token has been retrieved.
                        return next(authorizedRequest);
                    }

                    // Refresh token not retrieved, we can send error to global error handler.
                    return throwError(() => error);
                }),
            );
        }

        return throwError(() => error);
    }));
};
