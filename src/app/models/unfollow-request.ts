export class UnfollowRequest {
    public removeStatusesFromTimeline: boolean;
    public removeReblogsFromTimeline: boolean;

    constructor(
        removeStatusesFromTimeline: boolean,
        removeReblogsFromTimeline: boolean,
    ) {
        this.removeStatusesFromTimeline = removeStatusesFromTimeline;
        this.removeReblogsFromTimeline = removeReblogsFromTimeline;
    }
}