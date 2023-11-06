export enum NotificationType {
    /// Someone mentioned you in their status.
    Mention = 'mention',
    
    /// Someone you enabled notifications for has posted a status.
    Status = 'status',
    
    /// Someone boosted one of your statuses.
    Reblog = 'reblog',
    
    /// Someone followed you.
    Follow = 'follow',
    
    /// Someone requested to follow you.
    FollowRequest = 'followRequest',
    
    /// Someone favourited one of your statuses.
    Favourite = 'favourite',
    
    /// A status you boosted with has been edited.
    Update = 'update',
    
    /// Someone signed up (optionally sent to admins).
    AdminSignUp = 'adminSignUp',
    
    /// A new report has been filed.
    AdminReport = 'adminReport'
}