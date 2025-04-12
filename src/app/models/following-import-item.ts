import { FollowingImportItemStatus } from "./following-import-item-status";

export class FollowingImportItem {
    public id?: string;
    public account?: string;
    public showBoosts?: boolean;
    public languages?: string;
    public status?: FollowingImportItemStatus;
    public errorMessage?: string;
    public startedAt?: Date;
    public endedAt?: Date;
    public createdAt?: Date;
    public updatedAt?: Date;
}
