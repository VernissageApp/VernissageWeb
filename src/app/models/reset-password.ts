export class ResetPassword {
    public forgotPasswordGuid: string;
    public password: string;

    constructor(forgotPasswordGuid: string = '', password: string = '') {
        this.forgotPasswordGuid = forgotPasswordGuid;
        this.password = password;
    }
}
