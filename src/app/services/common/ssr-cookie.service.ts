import { Request } from 'express';
import { inject, Injectable, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { REQUEST } from 'express.tokens';

// Code copied from https://github.com/stevermeister/ngx-cookie-service.
// Service used by dependency didn't work (because of REQUEST injection).
@Injectable({
  providedIn: 'root',
})
export class SsrCookieService {
    private readonly documentIsAccessible: boolean;

    private document = inject(DOCUMENT);
    private platformId = inject(PLATFORM_ID);
    private request: Request | null = inject(REQUEST, { optional: true });

    constructor() {
        this.documentIsAccessible = isPlatformBrowser(this.platformId);
    }

    static getCookieRegExp(name: string): RegExp {
        // eslint-disable-next-line no-useless-escape
        const escapedName: string = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');
        return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
    }

    static safeDecodeURIComponent(encodedURIComponent: string): string {
        try {
            return decodeURIComponent(encodedURIComponent);
        } catch {
            return encodedURIComponent;
        }
    }

    check(name: string): boolean {
        name = encodeURIComponent(name);
        const regExp: RegExp = SsrCookieService.getCookieRegExp(name);

        const cookie = this.documentIsAccessible ? this.document.cookie : this.request?.headers.cookie
        if (!cookie) {
            return false;
        }

        return regExp.test(cookie);
    }

    get(name: string): string {
        if (this.check(name)) {
            name = encodeURIComponent(name);

            const regExp: RegExp = SsrCookieService.getCookieRegExp(name);

            const cookie = this.documentIsAccessible ? this.document.cookie : this.request?.headers.cookie;
            if (!cookie) {
                return '';
            }

            const result = regExp.exec(cookie);
            if (!result) {
                return '';
            }

            return result[1] ? SsrCookieService.safeDecodeURIComponent(result[1]) : '';
        } else {
            return '';
        }
    }

    getAll(): Record<string, string> {
        const cookies: Record<string, string> = {};
        const cookieString: any = this.documentIsAccessible ? this.document?.cookie : this.request?.headers.cookie;

        if (cookieString && cookieString !== '') {
            cookieString.split(';').forEach((currentCookie: any) => {
                const [cookieName, cookieValue] = currentCookie.split('=');
                cookies[SsrCookieService.safeDecodeURIComponent(cookieName.replace(/^ /, ''))] = SsrCookieService.safeDecodeURIComponent(cookieValue);
            });
        }

        return cookies;
    }

    set(
        name: string,
        value: string,
        expires?: number | Date,
        path?: string,
        domain?: string,
        secure?: boolean,
        sameSite?: 'Lax' | 'None' | 'Strict',
        partitioned?: boolean
    ): void;

    set(
        name: string,
        value: string,
        options?: {
            expires?: number | Date;
            path?: string;
            domain?: string;
            secure?: boolean;
            sameSite?: 'Lax' | 'None' | 'Strict';
            partitioned?: boolean;
        }
    ): void;

    set(
        name: string,
        value: string,
        expiresOrOptions?: number | Date | any,
        path?: string,
        domain?: string,
        secure?: boolean,
        sameSite?: 'Lax' | 'None' | 'Strict',
        partitioned?: boolean
    ): void {
        if (!this.documentIsAccessible) {
            return;
        }

        if (typeof expiresOrOptions === 'number' || expiresOrOptions instanceof Date || path || domain || secure || sameSite) {
            const optionsBody = {
                expires: expiresOrOptions,
                path,
                domain,
                secure,
                sameSite: sameSite ? sameSite : 'Lax',
                partitioned,
            };

            this.set(name, value, optionsBody);
            return;
        }

        let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';
        const options = expiresOrOptions ? expiresOrOptions : {};

        if (options.expires) {
            if (typeof options.expires === 'number') {
                const dateExpires: Date = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);
                cookieString += 'expires=' + dateExpires.toUTCString() + ';';
            } else {
                cookieString += 'expires=' + options.expires.toUTCString() + ';';
            }
        }

        if (options.path) {
            cookieString += 'path=' + options.path + ';';
        }

        if (options.domain) {
            cookieString += 'domain=' + options.domain + ';';
        }

        if (options.secure === false && options.sameSite === 'None') {
            options.secure = true;
            console.warn(
                `[ssr-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
                `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`
            );
        }

        if (options.secure) {
            cookieString += 'secure;';
        }

        if (!options.sameSite) {
            options.sameSite = 'Lax';
        }

        cookieString += 'sameSite=' + options.sameSite + ';';

        if (options.partitioned) {
            cookieString += 'Partitioned;';
        }

        this.document.cookie = cookieString;
    }

    delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
        if (!this.documentIsAccessible) {
            return;
        }

        const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
        this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
    }

    deleteAll(path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
        if (!this.documentIsAccessible) {
            return;
        }

        const cookies: any = this.getAll();

        for (const cookieName in cookies) {
            if (Object.prototype.hasOwnProperty.call(cookies, cookieName)) {
                this.delete(cookieName, path, domain, secure, sameSite);
            }
        }
    }
}