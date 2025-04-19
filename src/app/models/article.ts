import { ArticleVisibility } from "./article-visibility";
import { User } from "./user";

export class Article {
    public id?: string;
    public title?: string;
    public body = '';
    public bodyHtml?: string;
    public color?: string;
    public user?: User;
    public createdAt?: Date;
    public updatedAt?: Date;
    public visibilities?: ArticleVisibility[];
}
