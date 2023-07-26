import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {firstValueFrom} from 'rxjs';
import { RegisterUser } from 'src/app/models/register-user';

import {environment} from 'src/environments/environment';
import {ConfirmEmail} from 'src/app/models/confirm-email';
import {User} from 'src/app/models/user';
import {BooleanResult} from 'src/app/models/boolean-result';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async register(user: RegisterUser): Promise<User> {
        const event$= this.httpClient.post<User>(this.apiService + '/api/v1/register', user);
        return await firstValueFrom(event$);
    }

    public async confirm(confirmEmail: ConfirmEmail): Promise<object> {
        const event$ = this.httpClient.post(this.apiService + '/api/v1/account/email/confirm', confirmEmail);
        return await firstValueFrom(event$);
    }

    public isUserNameTaken(userName: string): Observable<BooleanResult> {
        return this.httpClient.get<BooleanResult>(this.apiService + '/api/v1/register/username/' + userName);
    }

    public isEmailConnected(email: string): Observable<BooleanResult> {
        return this.httpClient.get<BooleanResult>(this.apiService + '/api/v1/register/email/' + email);
    }
}
