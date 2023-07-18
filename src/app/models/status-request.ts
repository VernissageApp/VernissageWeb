import { StatusVisibility } from 'src/app/models/status-visibility';

export class StatusRequest {
    public id = '';
    public note = '';
    public visibility = StatusVisibility.Public;
    public sensitive = false;
    public contentWarning?: string;
    public commentsDisabled = false;
    public replyToStatusId?: string;
    public attachmentIds: string[] = [];
}