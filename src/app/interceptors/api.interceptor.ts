import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { Observable } from 'rxjs/internal/Observable';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthorizationService } from '../services/authorization/authorization.service';
import { from } from 'rxjs';

/* tslint:disable:no-any */

@Injectable()
export class APIInterceptor implements HttpInterceptor {
    private isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private authorizationService: AuthorizationService,
        private router: Router
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            withCredentials: true
        });

        // Executing orginal request.
        return next.handle(request).pipe(catchError(error => {
            // In case of unauthorized error we can try to refresh access tokens.
            if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {

                // We can try to refresh tokens only in the browser (SSR doen't contain tokens in cookies).
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
                                // Request after refresing token failed again, send error to global error handler.
                                throw innerError;
                            })
                        );
                }
            }

            console.error(error);
            throw error;
        }));
    }
}
