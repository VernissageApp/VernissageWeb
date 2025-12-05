import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { Observable } from 'rxjs/internal/Observable';
import { catchError, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AuthorizationService } from '../services/authorization/authorization.service';
import { from } from 'rxjs';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
    private isBrowser = false;

    private platformId = inject(PLATFORM_ID);
    private authorizationService = inject(AuthorizationService);

    constructor() {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            withCredentials: true,
            setHeaders: { 'X-XSRF-TOKEN': this.authorizationService.getXsrfToken() }
        });

        // Executing original request.
        return next.handle(request).pipe(catchError(error => {
            // In case of unauthorized error we can try to refresh access tokens.
            if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {

                // We can try to refresh tokens only in the browser (SSR doesn't contain tokens in cookies).
                if (this.isBrowser) {
                    // Sending refresh token.
                    return from(this.authorizationService.refreshAccessToken())
                        .pipe(
                            switchMap((result) => {
                                if (result) {
                                    // Sending same request once again when refresh token has been retrieve.
                                    return next.handle(request);
                                } else {
                                    // Refresh token not retrieved, we can send error to global error handler.
                                    throw error;
                                }
                            }),
                            catchError(innerError => {
                                // Request after refreshing token failed again, send error to global error handler.
                                throw innerError;
                            })
                        );
                }
            }

            throw error;
        }));
    }
}
