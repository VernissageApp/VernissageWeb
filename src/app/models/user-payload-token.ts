import { UserPayload } from "./user-payload";

export class UserPayloadToken {
    public accessToken?: string;
    public refreshToken?: string;
    public expirationDate: string;
    public xsrfToken?: string;
    public userPayload: UserPayload;

    constructor(expirationDate: string, xsrfToken: string | undefined, userPayload: UserPayload, accessToken?: string, refreshToken?: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expirationDate = expirationDate;
        this.xsrfToken = xsrfToken;
        this.userPayload = userPayload;
    }
}
