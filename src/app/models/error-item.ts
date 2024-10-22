import { ErrorItemSource } from "./error-item-source";

export class ErrorItem {
    public id?: string;
    public source: ErrorItemSource;
    public code: string;
    public message: string;
    public exception?: string;
    public userAgent?: string;
    public clientVersion?: string;
    public serverVersion?: string;
    public createdAt?: string;

    constructor(code: string, message: string, exception: string, clientVersion: string) {
        this.code = code;
        this.message = message;
        this.exception = exception;
        this.source = ErrorItemSource.Client;
        this.clientVersion = clientVersion
    }
}
