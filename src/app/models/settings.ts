import { EmailSecureMethod } from "./email-secure-method";
import { EventType } from "./event-type";

export class Settings {
    public isRegistrationOpened = false;
    public isRegistrationByApprovalOpened = false;
    public isRegistrationByInvitationsOpened = false;
    
    public isRecaptchaEnabled = false;
    public recaptchaKey = '';
    
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
    public webEmail = '';
    public webThumbnail = '';
    public webLanguages = '';
    public webContactUserId = '';
    public systemDefaultUserId = '';
}
