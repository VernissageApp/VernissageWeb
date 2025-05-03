import { BusinessCardField } from "./business-card-field";
import { User } from "./user";

export class BusinessCard {
    public id?: string;
    public user?: User;
    public title = '';
    public subtitle?: string;
    public body?: string;
    public website?: string;
    public telephone?: string;
    public email?: string;
    public color1 = '#ad5389';
    public color2 = '#3c1053';
    public color3 = '#ffffff';

    public fields?: BusinessCardField[];
}
