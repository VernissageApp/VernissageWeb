import { Injectable } from '@angular/core';

/* tslint:disable:no-any */

@Injectable({
    providedIn: 'root'
})
export class PersistanceService {

    set(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    setJson(key: string, data: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }

    get(key: string): string | null {
        return localStorage.getItem(key);
    }

    getJson(key: string): any {
        try {
            const value = localStorage.getItem(key);
            if (value == null) {
                return null;
            }

            return JSON.parse(value);
        } catch (e) {
            console.error('Error getting data from localStorage', e);

            return null;
        }
    }

    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage', e);
        }
    }

    setAccessToken(data: any): void {
        this.setJson('access_token', data);
    }

    getAccessToken(): any {
        return this.getJson('access_token');
    }

    removeAccessToken(): void {
        localStorage.removeItem('access_token');
    }

    setRefreshToken(data: any): void {
        this.setJson('refresh_token', data);
    }

    getRefreshToken(): any {
        return this.getJson('refresh_token');
    }

    removeRefreshToken(): void {
        localStorage.removeItem('refresh_token');
    }
}
