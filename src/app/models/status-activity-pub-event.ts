import { StatusActivityPubEventResult } from "./status-activity-pub-event-result";
import { StatusActivityPubEventType } from "./status-activity-pub-event-type";
import { User } from "./user";

export class StatusActivityPubEvent {
    public id = '';
    public user?: User;
    public statusId = '';
    public type?: StatusActivityPubEventType;
    public result?: StatusActivityPubEventResult;
    public errorMessage?: string;
    public attempts = 0;
    public startAt?: string;
    public endAt?: string;
    public createdAt = '';
    public updatedAt = '';
}
