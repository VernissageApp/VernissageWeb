import { Status } from "./status";
import { User } from "./user";

export class Report {
    public id = '';
    public user?: User;
    public reportedUser?: User;
    public status?: Status;
    public mainStatusId?: string;
    public comment?: string;
    public forward = false;
    public category?: string;
    public ruleIds?: number[];
    public considerationDate?: Date;
    public considerationUser?: User;
}
