import { Status } from './status';
import { User } from './user';

export interface DirectMessage {
    id: string;
    conversationId: string;
    status?: Status;
    author?: User;
    publishedAt?: string;
    deletedAt?: string;
    replyToStatusId?: string;
    recipients: User[];
    readAt?: string;
}
