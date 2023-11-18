export class ReportRequest {
    public reportedUserId?: string;
    public statusId?: string;
    public comment?: string;
    public forward = false;
    public category?: string;
    public ruleIds?: number[];
}
