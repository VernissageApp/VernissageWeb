export enum EventType {

    Unknown = 'unknown',

    AccountLogin = 'accountLogin',
    AccountRefresh = 'accountRefresh',
    AccountConfirm = 'accountConfirm',
    AccountChangeEmail = 'accountChangeEmail',
    AccountChangePassword = 'accountChangePassword',
    AccountForgotToken = 'accountForgotToken',
    AccountForgotConfirm = 'accountForgotConfirm',
    AccountRevoke = 'accountRevoke',
    
    AuthClientsCreate = 'authClientsCreate',
    AuthClientsList = 'authClientsList',
    AuthClientsRead = 'authClientsRead',
    AuthClientsUpdate = 'authClientsUpdate',
    AuthClientsDelete = 'authClientsDelete',
    
    RegisterNewUser = 'registerNewUser',
    RegisterUserName = 'registerUserName',
    RegisterEmail = 'registerEmail',
    
    RolesCreate = 'rolesCreate',
    RolesList = 'rolesList',
    RolesRead = 'rolesRead',
    RolesUpdate = 'rolesUpdate',
    RolesDelete = 'rolesDelete',
    
    UserRolesConnect = 'userRolesConnect',
    UserRolesDisconnect = 'userRolesDisconnect',
    
    UsersRead = 'usersRead',
    UsersUpdate = 'usersUpdate',
    UsersDelete = 'usersDelete',
    UsersFollow = 'usersFollow',
    UsersUnfollow = 'usersUnfollow',
    UsersFollowers = 'usersFollowers',
    UsersFollowing = 'usersFollowing',
    
    AvatarUpdate = 'avatarUpdate',
    AvatarDelete = 'avatarDelete',

    HeaderUpdate = 'headerUpdate',
    HeaderDelete = 'headerDelete',
    
    AttachmentsCreate = 'attachmentsCreate',
    AttachmentsUpdate = 'attachmentsUpdate',
    AttachmentsDelete = 'attachmentsDelete',
    
    SettingsList = 'settingsList',
    SettingsUpdate = 'settingsUpdate',
    
    ActivityPubRead = 'activityPubRead',
    ActivityPubInbox = 'activityPubInbox',
    ActivityPubOutbox = 'activityPubOutbox',
    ActivityPubFollowing = 'activityPubFollowing',
    ActivityPubFollowers = 'activityPubFollowers',
    ActivityPubLiked = 'activityPubLiked',
    ActivityPubSharedInbox = 'activityPubSharedInbox',
    ActivityPubStatus = 'activityPubStatus',
    
    Webfinger = 'webfinger',
    Nodeinfo = 'nodeinfo',
    HostMeta = 'hostMeta',
    Instance = 'instance',
    
    CountriesList = 'countriesList',
    LocationsList = 'locationsList',
    LocationsRead = 'locationsRead',
    
    StatusesList = 'statusesList',
    StatusesCreate = 'statusesCreate',
    StatusesRead = 'statusesRead',
    StatusesUpdate = 'statusesUpdate',
    StatusesDelete = 'statusesDelete',
    StatusesReblog = 'statusesReblog',
    StatusesUnreblog = 'statusesUnreblog',
    StatusesFavourite = 'statusesFavourite',
    StatusesUnfavourite = 'statusesUnfavourite',
    StatusesBookmark = 'statusesBookmark',
    StatusesUnbookmark = 'statusesUnbookmark',
    
    TimelinesPublic = 'timelinesPublic',
    TimelinesHome = 'timelinesHome',
    
    FollowRequestList = 'followRequestList',
    FollowRequestApprove = 'followRequestApprove',
    FollowRequestReject = 'followRequestReject',
    
    NotificationsList = 'notificationsList',
    Relationships = 'relationships',
    Search = 'search',

    InvitationList = 'invitationList',
    InvitationGenerate = 'invitationGenerate',
    InvitationDelete = 'invitationDelete'
}