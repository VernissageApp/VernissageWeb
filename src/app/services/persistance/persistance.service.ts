/* tslint:disable:no-any */

export abstract class  PersistanceService {
    abstract set(key: string, value: string): void;
    abstract setJson(key: string, data: any): void;
    abstract get(key: string): string | null;
    abstract getJson(key: string): any;
    abstract remove(key: string): void;
}


export class PersistanceBrowserService implements PersistanceService {

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
}

export class PersistanceServerService implements PersistanceService {
    set(key: string, value: string): void {
    }

    setJson(key: string, data: any): void {
    }

    get(key: string): string | null {
        return null;
    }

    getJson(key: string): any {
        return null;
    }

    remove(key: string): void {
    }
}