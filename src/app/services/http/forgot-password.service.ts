import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

import {environment} from 'src/environments/environment';
import {ForgotPassword} from 'src/app/models/forgot-password';
import {ResetPassword} from 'src/app/models/reset-password';

@Injectable({
    providedIn: 'root'
})
export class ForgotPasswordService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async token(forgotPassword: ForgotPassword): Promise<object> {
        const event$ = this.httpClient.post(this.apiService + '/api/v1/account/forgot/token', forgotPassword);
        return await firstValueFrom(event$);
    }

    public async confirm(resetPassword: ResetPassword): Promise<object> {
        const event$ = this.httpClient.post(this.apiService + '/api/v1/account/forgot/confirm', resetPassword);
        return await firstValueFrom(event$);
    }
}
