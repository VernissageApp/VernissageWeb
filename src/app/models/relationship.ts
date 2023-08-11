export class Relationship {
    public userId?: string
    
    /// If signed in user is following particural user (`source -> target`).
    public following?: boolean;
    
    /// If signed in user is followed by particural user (`source <- target`)
    public followedBy?: boolean;
    
    /// If signed in user requested follow (`source -> (request) -> target`).
    public requested?: boolean;
    
    /// If signed in user has been requested by particural user (`source <- (request) <- target`).
    public requestedBy?: boolean;
}
