import { Configuration } from 'src/app/models/configuration';
import { InstanceStatistics } from 'src/app/models/instance-statistics';
import { User } from 'src/app/models/user';

export class Instance {
    public uri?: string;
    public title?: string;
    public description?: string;
    public email?: string;
    public version?: string;
    public thumbnail?: string;
    public languages?: string[];
    public rules?: string[];

    public registrationOpened = false;
    public registrationByApprovalOpened = false;
    public registrationByInvitationsOpened = false;

    public configuration?: Configuration;
    public stats?: InstanceStatistics;
    public contact?: User;
}
