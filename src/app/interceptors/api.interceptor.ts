import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/operators';
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

        return next.handle(request).pipe(catchError(error => from(this.handleAuthErrorAsync(error))));
    }

    private async handleAuthErrorAsync(error: HttpErrorResponse): Promise<any> {
        if (error) {
            switch (error.status) {
                case 401:
                    if (this.isBrowser) {
                        await this.authorizationService.signOut();
                    }

                    await this.router.navigateByUrl('/login');
                    break;
                default:
                    console.error(error);
            }
        } else {
            console.error('Something else happened.');
        }

        throw error;
    }
}
