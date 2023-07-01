import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/* tslint:disable:no-any */

@Injectable()
export class APIInterceptor implements HttpInterceptor {

    constructor(private router: Router) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(x => this.handleAuthError(x)));
    }

    private handleAuthError(error: HttpErrorResponse): Observable<any> {

        if (error) {
            if (error.error instanceof ErrorEvent) {
                console.error('Error Event');
                console.error(error);
            } else {
                switch (error.status) {
                    case 401:
                        this.router.navigateByUrl('/login');
                        break;
                    case 403:
                        this.router.navigateByUrl('/access-forbidden');
                        break;
                    case 404:
                        this.router.navigateByUrl('/page-not-found');
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
