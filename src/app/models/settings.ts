import { EmailSecureMethod } from "./email-secure-method";
import { EventType } from "./event-type";

export class Settings {
    public isRegistrationOpened = false;
    public isRegistrationByApprovalOpened = false;
    public isRegistrationByInvitationsOpened = false;
    
    public isQuickCaptchaEnabled = false;
    
    public corsOrigin = '';
    public maximumNumberOfInvitations = 0;
    public maxCharacters = 500;
    public maxMediaAttachments = 4;
    public imageSizeLimit = 10_485_760;
    
    public emailHostname = '';
    public emailPort = 0;
    public emailUserName = '';
    public emailPassword = '';
    public emailSecureMethod = EmailSecureMethod.None;
    public emailFromAddress = '';
    public emailFromName = '';
    
    public eventsToStore: EventType[] = [];
    public webTitle = '';
    public webDescription = '';
    public webLongDescription = '';
    public webEmail = '';
    public webThumbnail = '';
    public webLanguages = '';
    public webContactUserId = '';
    public systemDefaultUserId = '';
    public patreonUrl = '';
    public mastodonUrl = '';
    public statusPurgeAfterDays = 180;
    public imagesUrl = '';
    public imageQuality = 85;
    public showNews = false;
    public showNewsForAnonymous = false;
    public showSharedBusinessCards = false;

    public isOpenAIEnabled = false;
    public openAIKey = '';
    public openAIModel = '';

    public isWebPushEnabled = false;
    public webPushEndpoint = '';
    public webPushSecretKey = '';
    public webPushVapidPublicKey = '';
    public webPushVapidPrivateKey = '';
    public webPushVapidSubject = '';

    public totalCost = 0;
    public usersSupport = 0;

    public showLocalTimelineForAnonymous = false;
    public showTrendingForAnonymous = false;
    public showEditorsChoiceForAnonymous = false;
    public showEditorsUsersChoiceForAnonymous = false;
    public showHashtagsForAnonymous = false;
    public showCategoriesForAnonymous = false;

    // Privacy and Terms of Service.
    public privacyPolicyUpdatedAt = '';
    public privacyPolicyContent = '';
    public termsOfServiceUpdatedAt = '';
    public termsOfServiceContent = '';

    // Custom style and script.
    public customInlineScript = '';
    public customInlineStyle = '';
    public customFileScript = '';
    public customFileStyle = '';
}
