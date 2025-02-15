import { User } from "./user";

export class UserPayloadToken {
    public expirationDate: string;
    public xsrfToken: string;
    public userPayload: User;

    constructor(expirationDate: string, xsrfToken: string, userPayload: User) {
        this.expirationDate = expirationDate;
        this.xsrfToken = xsrfToken;
        this.userPayload = userPayload;
    }
}
