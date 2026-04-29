import { UserPayload } from "./user-payload";

export class UserPayloadToken {
    public expirationDate: string;
    public xsrfToken: string;
    public userPayload: UserPayload;

    constructor(expirationDate: string, xsrfToken: string, userPayload: UserPayload) {
        this.expirationDate = expirationDate;
        this.xsrfToken = xsrfToken;
        this.userPayload = userPayload;
    }
}
