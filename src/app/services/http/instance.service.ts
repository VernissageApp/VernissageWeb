import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Instance } from 'src/app/models/instance';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class InstanceService {
    private _instance?: Instance;

    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public get instance(): Instance | undefined {
        return this._instance;
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
        const event$ = this.httpClient.get<Instance>(this.windowService.apiUrl() +  '/api/v1/instance');
        return await firstValueFrom(event$);
    }
}
