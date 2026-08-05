import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SsrAccessTokenService {
    private accessToken?: string;

    get(): string | undefined {
        return this.accessToken;
    }

    set(accessToken: string): void {
        this.accessToken = accessToken;
    }

    clear(): void {
        this.accessToken = undefined;
    }
}
