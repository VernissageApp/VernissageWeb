export class SharedBusinessCardUpdateRequest {
    /// Third party name.
    public thirdPartyName?: string;
    
    /// Third party email.
    public thirdPartyEmail?: string;
    
    /// Base url to web application. It's used to send email with shared card url.
    public sharedCardUrl = '';
}
