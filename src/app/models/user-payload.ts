export class UserPayload {    
    public id = '';
    public userName = '';
    public email?: string;
    public name?: string;
    public exp?: Date;
    public avatarUrl?: string;
    public headerUrl?: string;
    public roles: string[] = [];
    public scopes: string[] = [];
    public application = '';
    public isMovedTo = false;
}
