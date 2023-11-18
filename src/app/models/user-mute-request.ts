export class UserMuteRequest {
    public muteStatuses: boolean;
    public muteReblogs: boolean;
    public muteNotifications: boolean;
    public muteEnd?: Date

    constructor(muteStatuses: boolean, muteReblogs: boolean, muteNotifications: boolean, muteEnd?: Date) {
        this.muteStatuses = muteStatuses
        this.muteReblogs = muteReblogs
        this.muteNotifications = muteNotifications
        this.muteEnd = muteEnd
    }
}