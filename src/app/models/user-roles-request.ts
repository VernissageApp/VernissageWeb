export class UserRoleRequest {
    public userId: string;
    public roleCode: string;

    constructor(userId: string, roleCode: string) {
        this.userId = userId;
        this.roleCode = roleCode;
    }
}
