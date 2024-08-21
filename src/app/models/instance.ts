import { Configuration } from './configuration';
import { InstanceStatistics } from './instance-statistics';
import { User } from './user';
import { Rule } from './rule';

export class Instance {
    public uri?: string;
    public title?: string;
    public description?: string;
    public longDescription?: string;
    public email?: string;
    public version?: string;
    public thumbnail?: string;
    public languages?: string[];
    public rules?: Rule[];

    public registrationOpened = false;
    public registrationByApprovalOpened = false;
    public registrationByInvitationsOpened = false;

    public configuration?: Configuration;
    public stats?: InstanceStatistics;
    public contact?: User;
}
