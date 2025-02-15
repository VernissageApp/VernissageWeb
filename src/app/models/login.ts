export class Login {
    public userNameOrEmail: string;
    public password: string;
    public useCookies = true;
    public trustMachine = false;

    constructor(userNameOrEmail: string, password: string, trustMachine: boolean) {
        this.userNameOrEmail = userNameOrEmail;
        this.password = password;
        this.trustMachine = trustMachine;
    }
}
