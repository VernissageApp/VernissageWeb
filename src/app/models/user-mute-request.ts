export class UserMuteRequest {
    public muteStatuses: boolean;
    public muteReblogs: boolean;
    public muteNotifications: boolean;
    public removeStatusesFromTimeline: boolean;
    public removeReblogsFromTimeline: boolean;
    public muteEnd?: Date

    constructor(
        muteStatuses: boolean,
        muteReblogs: boolean,
        muteNotifications: boolean,
        removeStatusesFromTimeline: boolean,
        removeReblogsFromTimeline: boolean,
        muteEnd?: Date
    ) {
        this.muteStatuses = muteStatuses;
        this.muteReblogs = muteReblogs;
        this.muteNotifications = muteNotifications;
        this.muteEnd = muteEnd;
        this.removeStatusesFromTimeline = removeStatusesFromTimeline;
        this.removeReblogsFromTimeline = removeReblogsFromTimeline;
    }
}