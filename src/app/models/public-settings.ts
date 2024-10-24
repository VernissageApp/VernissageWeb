export class PublicSettings {
    public maximumNumberOfInvitations = 0;
    public isOpenAIEnabled = false;
    public webPushVapidPublicKey?: string;
    public s3Address?: string;

    public patreonUrl?: string;
    public mastodonUrl?: string;
    public totalCost = 0;
    public usersSupport = 0;

    public showLocalTimelineForAnonymous = false;
    public showTrendingForAnonymous = false;
    public showEditorsChoiceForAnonymous = false;
    public showEditorsUsersChoiceForAnonymous = false;
    public showHashtagsForAnonymous = false;
    public showCategoriesForAnonymous = false;
}
