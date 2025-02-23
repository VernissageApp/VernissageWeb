import { CategoryHashtag } from "./category-hashtag";

export class Category {
    public id?: string;
    public name = '';
    public priority = 0;
    public hashtags?: CategoryHashtag[];
}
