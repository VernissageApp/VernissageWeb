export class ResetPassword {
    public forgotPasswordGuid: string;
    public password: string;

    constructor(forgotPasswordGuid = '', password = '') {
        this.forgotPasswordGuid = forgotPasswordGuid;
        this.password = password;
    }
}
