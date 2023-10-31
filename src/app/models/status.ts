import { Attachment } from 'src/app/models/attachment';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { User } from './user';

export class Status {
    public id = '';
    public note = '';
    public noteHtml = '';
    public visibility = StatusVisibility.Public;
    public sensitive = false;
    public contentWarning?: string;
    public commentsDisabled = false;
    public replyToStatusId?: string;

    public attachments?: Attachment[];
    public user?: User;
}