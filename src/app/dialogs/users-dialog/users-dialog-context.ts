export enum UsersListType {
    reblogged,
    favourited
}

export class UsersDialogContext {
    public statusId: string;
    public usersListType: UsersListType;
    public title: string;

    constructor(statusId: string, usersListType: UsersListType, title: string) {
        this.statusId = statusId;
        this.usersListType = usersListType;
        this.title = title;
    }
}
