import { FlexiField } from "./flexi-field";
import { Role } from "./role";

export class User {
    public id?: string;
    public isLocal?: boolean;
    public isBlocked?: boolean;
    public isApproved?: boolean;
    public userName?: string;
    public email?: string;
    public password?: string;
    public name?: string;
    public bio?: string;
    public securityToken?: string;
    public gravatarHash?: string;
    public redirectBaseUrl?: string;
    public locale?: string;
    public avatarUrl?: string;
    public headerUrl?: string;
    public agreement?: boolean;
    public emailWasConfirmed?: boolean;
    public fields?: FlexiField[];
    public roles?: Role[];
    public bioHtml?: string;
    public activityPubProfile?: string;
    public statusesCount = 0;
    public followersCount = 0;
    public followingCount = 0;
    public twoFactorEnabled = false;
    public createdAt = '';
    public updatedAt = '';
}
