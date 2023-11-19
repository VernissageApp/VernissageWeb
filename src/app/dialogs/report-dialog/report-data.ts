import { Status } from "src/app/models/status";
import { User } from "src/app/models/user";

export class ReportData {
    public user?: User;
    public status?: Status;

    constructor(user?: User, status?: Status) {
        this.user = user;
        this.status = status;
    }
}
