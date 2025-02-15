import { ArchiveStatus } from "./archive-status";
import { User } from "./user";

export class Archive {
    public id = '';
    public user?: User;
    public requestDate?: Date;
    public startDate?: Date;
    public endDate?: Date;
    public fileName?: string;
    public status?: ArchiveStatus;
    public errorMessage?: string;
    public createdAt?: Date;
    public updatedAt?: Date;
}
