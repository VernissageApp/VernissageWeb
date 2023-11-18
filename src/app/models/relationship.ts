export class Relationship {
    public userId?: string
    
    /// If signed in user is following particural user (`source -> target`).
    public following = false;
    
    /// If signed in user is followed by particural user (`source <- target`)
    public followedBy = false;
    
    /// If signed in user requested follow (`source -> (request) -> target`).
    public requested = false;
    
    /// If signed in user has been requested by particural user (`source <- (request) <- target`).
    public requestedBy = false;

    /// If signed in user muted user's statuses.
    public mutedStatuses = false;
    
    /// If signed in user muted user's reblogs.
    public mutedReblogs = false;
    
    /// If signed in user muted user's notifications.
    public mutedNotifications = false;
}
