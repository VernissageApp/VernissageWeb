import { EmailSecureMethod } from "./email-secure-method";
import { EventType } from "./event-type";

export class Settings {
    public isRegistrationOpened = false;
    public isRegistrationByApprovalOpened = false;
    public isRegistrationByInvitationsOpened = false;
    
    public isRecaptchaEnabled = false;
    public recaptchaKey = '';
    
    public corsOrigin = '';
    
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
}
