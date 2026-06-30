import { Notification } from './notification';
import { Status } from './status';

export type NotificationListItem = NotificationItem | NotificationGroupItem;

export interface NotificationItem {
    kind: 'notification';
    id: string;
    notification: Notification;
}

export interface NotificationGroupItem {
    kind: 'group';
    id: string;
    notifications: Notification[];
    representative: Notification;
    visibleNotifications: Notification[];
    hiddenNotificationsCount: number;
    latestCreatedAt: string;
    linkedStatus?: Status;
}
