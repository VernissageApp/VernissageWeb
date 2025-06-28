export class PublicSettings {
    public maximumNumberOfInvitations = 0;
    public isOpenAIEnabled = false;
    public webPushVapidPublicKey?: string;
    public imagesUrl?: string;
    public showNews = false;
    public showNewsForAnonymous = false;
    public showSharedBusinessCards = false;
    public isQuickCaptchaEnabled = false;

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

    // Privacy and Terms of Service.
    public privacyPolicyUpdatedAt = ''
    public privacyPolicyContent = ''
    public termsOfServiceUpdatedAt = ''
    public termsOfServiceContent = ''

    // Custom script and style content.
    public customInlineScript?: string;
    public customInlineStyle?: string;
    public customFileScript?: string;
    public customFileStyle?: string;
}
