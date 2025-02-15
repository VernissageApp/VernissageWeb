import { Hashtag } from './hashtag';
import { Status } from './status';
import { User } from './user';

export class SearchResults {
    public users?: User[];
    public hashtags?: Hashtag[];
    public statuses?: Status[];
}