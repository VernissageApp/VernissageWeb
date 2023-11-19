import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Report } from 'src/app/models/report';
import { UserRoleRequest } from 'src/app/models/user-roles-request';

@Injectable({
    providedIn: 'root'
})
export class UserRolesService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async connect(id: string, code: string): Promise<void> {
        const userRoleRequest = new UserRoleRequest(id, code);
        const event$ = this.httpClient.post<Report>(this.windowService.apiUrl() + `/api/v1/user-roles/connect`, userRoleRequest);
        await firstValueFrom(event$);
    }

    public async disconnect(id: string, code: string): Promise<void> {
        const userRoleRequest = new UserRoleRequest(id, code);
        const event$ = this.httpClient.post<Report>(this.windowService.apiUrl() + `/api/v1/user-roles/disconnect`, userRoleRequest);
        await firstValueFrom(event$);
    }
}
