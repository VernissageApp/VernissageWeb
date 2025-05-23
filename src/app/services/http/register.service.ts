import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { firstValueFrom } from 'rxjs';
import { RegisterUser } from 'src/app/models/register-user';
import { ConfirmEmail } from 'src/app/models/confirm-email';
import { User } from 'src/app/models/user';
import { BooleanResult } from 'src/app/models/boolean-result';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async register(user: RegisterUser): Promise<User> {
        const event$= this.httpClient.post<User>(this.windowService.apiUrl() + '/api/v1/register', user);
        return await firstValueFrom(event$);
    }

    public async confirm(confirmEmail: ConfirmEmail): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/email/confirm', confirmEmail);
        return await firstValueFrom(event$);
    }

    public isUserNameTaken(userName: string): Observable<BooleanResult> {
        return this.httpClient.get<BooleanResult>(this.windowService.apiUrl() + '/api/v1/register/username/' + userName);
    }

    public isEmailConnected(email: string): Observable<BooleanResult> {
        return this.httpClient.get<BooleanResult>(this.windowService.apiUrl() + '/api/v1/register/email/' + email);
    }
}
