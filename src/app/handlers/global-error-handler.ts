import { HttpStatusCode } from '@angular/common/http';
import { ErrorHandler, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { ObjectNotFoundError } from 'src/app/errors/object-not-found-error';
import { IHttpResponse } from 'src/app/models/http-response';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

export class GlobalErrorHandler implements ErrorHandler {

    constructor(
        private injector: Injector,
        private zone: NgZone,
        private authorizationService: AuthorizationService
    ) { }

    private get router(): Router {
        return this.injector.get(Router);
    }

    async handleError(error: any): Promise<void> {
        await this.zone.run(async () => {
            console.error(error);

            if (this.isObjectNotFoundError(error)) {
                await this.router.navigate(['/page-not-found']);
                return;
            }

            if (this.isForbiddenError(error)) {
                await this.router.navigate(['/forbidden']);
                return;
            }

            const httpResponse = this.getErrorResponse(error);
            if (httpResponse) {
                switch (httpResponse.statusCode) {
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
                        await this.authorizationService.signOut();
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

    private getErrorResponse(error: any): IHttpResponse {
        const data = error.rejection ? error.rejection.data : error.data;
        return data && data[0] ? data[0].response : null;
    }

    private isObjectNotFoundError(error: any): boolean {
        return error instanceof ObjectNotFoundError || (error.rejection && error.rejection instanceof ObjectNotFoundError);
    }

    private isForbiddenError(error: any): boolean {
        return error instanceof ForbiddenError || (error.rejection && error.rejection instanceof ForbiddenError);
    }
}