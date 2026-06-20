import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ErrorParserService {
    getStringFromError(error: any): string {
        const seenObjects = new WeakSet<object>();

        try {
            const stringified = JSON.stringify(error, (_key, value) => {
                return this.getSerializableValue(value, seenObjects);
            }, 2);

            if (stringified && stringified !== '{ }' && stringified !== '{}') {
                return stringified;
            }
        } catch {
            // Fall back to String(error) when JSON serialization fails for any unexpected value.
        }

        return String(error);
    }

    private getSerializableValue(value: any, seenObjects: WeakSet<object>): any {
        if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
            return String(value);
        }

        if (value === undefined) {
            return 'undefined';
        }

        if (value === null || typeof value !== 'object') {
            return value;
        }

        if (seenObjects.has(value)) {
            return '[Circular]';
        }

        seenObjects.add(value);

        if (Array.isArray(value)) {
            return value;
        }

        if (value instanceof Map) {
            return Object.fromEntries(value);
        }

        if (value instanceof Set) {
            return Array.from(value);
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (value instanceof RegExp) {
            return String(value);
        }

        if (value instanceof Error) {
            return this.toPlainObject(value);
        }

        const plainObject = this.toPlainObject(value);

        if (Object.keys(plainObject).length > 0) {
            return plainObject;
        }

        return String(value);
    }

    private toPlainObject(value: any): any {
        const error: any = { };
        const propertyNames = new Set(Object.getOwnPropertyNames(value));

        ['name', 'message', 'stack', 'status', 'statusText', 'url', 'error', 'rejection', 'reason'].forEach((propName) => {
            if (propName in value) {
                propertyNames.add(propName);
            }
        });

        propertyNames.forEach((propName) => {
            try {
                error[propName] = value[propName];
            } catch {
                error[propName] = '[Unreadable]';
            }
        });

        return error;
    }
}
