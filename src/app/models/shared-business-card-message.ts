export class SharedBusinessCardMessage {
    public id?: string;
    public message = '';
    public addedByUser = false

    constructor(message: string, addedByUser: boolean) {
        this.message = message;
        this.addedByUser = addedByUser;
    }
}
