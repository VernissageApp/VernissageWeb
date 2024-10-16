import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { ObjectNotFoundError } from 'src/app/errors/object-not-found-error';
import { PageNotFoundError } from 'src/app/errors/page-not-found-error';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from '../services/common/loading.service';
import { SentryErrorHandler } from '@sentry/angular-ivy';
import { isPlatformBrowser } from '@angular/common';
import { PersistanceService } from '../services/persistance/persistance.service';
import { CustomError } from '../errors/custom-error';

export class GlobalErrorHandler extends SentryErrorHandler {
    private isBrowser = false;

    constructor(
        platformId: object,
        private injector: Injector,
        private zone: NgZone,
        private authorizationService: AuthorizationService,
        private persistanceService: PersistanceService,
        private loadingService: LoadingService
    ) {
        super();
        this.isBrowser = isPlatformBrowser(platformId);
    }

    private get router(): Router {
        return this.injector.get(Router);
    }

    override async handleError(error: any): Promise<void> {
        await this.zone.run(async () => {
            console.error(error);
            super.handleError(error);
            this.storeInLocalStorage(error);

            this.loadingService.hideLoader();

            if (this.isObjectNotFoundError(error) || this.isPageNotFoundError(error)) {
                await this.router.navigate(['/page-not-found']);
                return;
            }

            if (this.isForbiddenError(error)) {
                await this.router.navigate(['/forbidden']);
                return;
            }

            const httpResponse = this.getErrorResponse(error);
            if (httpResponse) {
                switch (httpResponse.status) {
                    case 0:
                        await this.router.navigate(['/connection-lost'], { skipLocationChange: true });
                        break;
                    case HttpStatusCode.NotFound:
                        await this.router.navigate(['/page-not-found']);
                        break;
                    case HttpStatusCode.Forbidden:
                        await this.router.navigate(['/access-forbidden']);
                        break;
                    case HttpStatusCode.Unauthorized:
                        // We don't need to sign out when we render page on server.
                        if (this.isBrowser) {
                            await this.authorizationService.signOut();
                        }

                        await this.router.navigate(['/login']);
                        break;
                    default:
                        await this.router.navigate(['/unexpected-error'], { skipLocationChange: true });
                        break;
                }
            } else {
                await this.router.navigate(['/unexpected-error'], { skipLocationChange: true });
            }
        });
    }

    private getErrorResponse(error: any): HttpErrorResponse {
        if (error instanceof HttpErrorResponse) {
            return error;
        }

        return error.rejection;
    }

    private isObjectNotFoundError(error: any): boolean {
        return error instanceof ObjectNotFoundError || (error.rejection && error.rejection instanceof ObjectNotFoundError);
    }

    private isPageNotFoundError(error: any): boolean {
        return error instanceof PageNotFoundError || (error.rejection && error.rejection instanceof PageNotFoundError);
    }

    private isForbiddenError(error: any): boolean {
        return error instanceof ForbiddenError || (error.rejection && error.rejection instanceof ForbiddenError);
    }

    private storeInLocalStorage(error: any): void {
        if (error instanceof Error) {
            const plainObject = this.toPlainObject(error);
            const stringified = JSON.stringify(plainObject, null, 2);
            this.persistanceService.set('exception', stringified.trim());
        } else if (typeof error === 'object' && error !== null) {
            const stringified = JSON.stringify(error, null, 2);
            this.persistanceService.set('exception', stringified.trim());
        } else {
            const customError = new CustomError(error);
            const stringified = JSON.stringify(customError, null, 2);
            this.persistanceService.set('exception', stringified.trim());
        }
    }

    private toPlainObject(value: any) {
        const error: any = { };

        Object.getOwnPropertyNames(value).forEach(function (propName) {
            error[propName] = value[propName];
        });

        return error;
    }
}
