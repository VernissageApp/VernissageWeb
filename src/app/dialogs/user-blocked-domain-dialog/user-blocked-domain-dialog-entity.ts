import { UserBlockedDomain } from "src/app/models/user-blocked-domain";

export class UserBlockedDomainDialogEntity {
    public title: string;
    public entity: UserBlockedDomain;
    public showLegend = false;

    constructor(title: string, entity: UserBlockedDomain, showLegend: boolean) {
        this.title = title;
        this.entity = entity;
        this.showLegend = showLegend;
    }
}
