import { StatusVisibility } from 'src/app/models/status-visibility';
import { Category } from './category';

export class StatusRequest {
    public id = '';
    public note = '';
    public visibility = StatusVisibility.Public;
    public sensitive = false;
    public contentWarning?: string;
    public commentsDisabled = false;
    public replyToStatusId?: string;
    public attachmentIds: string[] = [];
    public categoryId?: string;
}