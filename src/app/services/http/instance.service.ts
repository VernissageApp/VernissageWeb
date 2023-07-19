import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Instance } from 'src/app/models/instance';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InstanceService {
    private _instance?: Instance;

    public get instance(): Instance | undefined {
        if (!this._instance) {
            (async () => this.load())();
        }

        return this._instance;
    }

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async load(): Promise<void> {
        this._instance = await this.get();
    }

    public isRegistrationEnabled(): boolean {
        return this.instance?.registrationOpened === true
            || this.instance?.registrationByApprovalOpened === true
            || this.instance?.registrationByInvitationsOpened === true;
    }

    private async get(): Promise<Instance> {
        const event$ = this.httpClient.get<Instance>(this.apiService +  '/api/v1/instance');
        return await firstValueFrom(event$);
    }
}
