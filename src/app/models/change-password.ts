export class ChangePassword {
    public currentPassword: string;
    public newPassword: string;

    constructor(currentPassword = '', newPassword = '') {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}
