import { User } from "./user";

export class UserPayloadToken {
    public expirationDate: string;
    public userPayload: User;

    constructor(expirationDate: string, userPayload: User) {
        this.expirationDate = expirationDate;
        this.userPayload = userPayload;
    }
}
