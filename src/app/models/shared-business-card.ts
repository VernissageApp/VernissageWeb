import { BusinessCard } from "./business-card";
import { SharedBusinessCardMessage } from "./shared-business-card-message";

export class SharedBusinessCard {
    public id?: string;
    public businessCardId?: string;
    public businessCard?: BusinessCard;
    public code?: string;
    public title = '';
    public note?: string;
    public thirdPartyName?: string;
    public thirdPartyEmail?: string;
    public revokedAt?: Date;
    public createdAt?: Date;
    public updatedAt?: Date;
    
    public messages?: SharedBusinessCardMessage[];
}
