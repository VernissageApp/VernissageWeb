import { NotificationType } from './notification-type';
import { Status } from './status';
import { User } from './user';

export class Notification {
    public id = '';
    public notificationType?: NotificationType;
    public byUser?: User;
    public status?: Status;
    public mainStatus?: Status;
    public createdAt = '';
}
