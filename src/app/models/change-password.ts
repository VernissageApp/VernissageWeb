export class ChangePassword {
    public currentPassword: string;
    public newPassword: string;

    constructor(currentPassword: string = '', newPassword: string = '') {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}
