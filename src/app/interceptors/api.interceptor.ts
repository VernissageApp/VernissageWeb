import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/* tslint:disable:no-any */

@Injectable()
export class APIInterceptor implements HttpInterceptor {
    private isBrowser = false;

    constructor(@Inject(PLATFORM_ID) platformId: Object, private router: Router) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(x => this.handleAuthError(x)));
    }

    private handleAuthError(error: HttpErrorResponse): Observable<any> {

        if (error) {
            if (this.isBrowser) {
                if (error.error instanceof ErrorEvent) {
                    console.error('Error Event');
                    console.error(error);
                } else {
                    switch (error.status) {
                        case 401:
                            this.router.navigateByUrl('/login');
                            break;
                    }
                }
            } else {
                switch (error.status) {
                    case 401:
                        this.router.navigateByUrl('/login');
                        break;
                }
            }
        } else {
            console.error('Something else happened.');
            console.error(error);
        }

        throw error;
    }
}
