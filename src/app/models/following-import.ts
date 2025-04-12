import { FollowingImportItem } from "./following-import-item";
import { FollowingImportStatus } from "./following-import-status";

export class FollowingImport {
    public id?: string;
    public status?: FollowingImportStatus;
    public startedAt?: Date;
    public endedAt?: Date;
    public createdAt?: Date;
    public updatedAt?: Date;
    public followingImportItems: FollowingImportItem[] = [];
}
