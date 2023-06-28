export class ConfirmEmail {
    public id: string;
    public confirmationGuid: string;

    constructor(id: string, confirmationGuid: string) {
        this.id = id;
        this.confirmationGuid = confirmationGuid;
    }
}
