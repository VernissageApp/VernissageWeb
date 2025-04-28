import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ForgotPassword } from 'src/app/models/forgot-password';
import { ResetPassword } from 'src/app/models/reset-password';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class ForgotPasswordService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async token(forgotPassword: ForgotPassword): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/forgot/token', forgotPassword);
        return await firstValueFrom(event$);
    }

    public async confirm(resetPassword: ResetPassword): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/forgot/confirm', resetPassword);
        return await firstValueFrom(event$);
    }
}
