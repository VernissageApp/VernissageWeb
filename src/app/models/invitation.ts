import { User } from "./user";

export class Invitation {
    public id = '';
    public code = '';
    public user?: User;
    public invited?: User;
    public createdAt?: Date
    public updatedAt?: Date
}
