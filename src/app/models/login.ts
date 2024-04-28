export class Login {
    public userNameOrEmail: string;
    public password: string;
    public useCookies = true;

    constructor(userNameOrEmail: string, password: string) {
        this.userNameOrEmail = userNameOrEmail;
        this.password = password;
    }
}
