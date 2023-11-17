import { Attachment } from 'src/app/models/attachment';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { User } from './user';
import { Category } from './category';

export class Status {
    public id = '';
    public note = '';
    public noteHtml = '';
    public application?: String;
    public createdAt = '';
    public updatedAt = '';
    public visibility = StatusVisibility.Public;
    public sensitive = false;
    public contentWarning?: string;
    public commentsDisabled = false;
    public replyToStatusId?: string;

    public repliesCount = 0;
    public reblogsCount = 0;
    public favouritesCount = 0;
    public favourited = false;
    public reblogged = false;
    public bookmarked = false;

    public reblog?: Status;
    public attachments?: Attachment[];
    public user?: User;
    public category?: Category;
}