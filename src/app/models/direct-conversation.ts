import { User } from './user';

export interface DirectConversation {
    id: string;
    participants: User[];
    lastStatusId?: string;
    summary?: string;
    lastMessageDeletedAt?: string;
    lastActivityAt: string;
    hasUnreadMessages: boolean;
    lastReadAt?: string;
    isMuted: boolean;
}
