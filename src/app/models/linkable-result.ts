import { ContextTimeline } from "./context-timeline";

export class LinkableResult<T>  {
    public maxId?: string;
    public minId?: string;
    public data: T[] = [];

    public context = ContextTimeline.unknown;
    public hashtag?: string;
    public category?: string;
    public user?: string;

    public static copy<T>(value: LinkableResult<T>): LinkableResult<T> {
        const newValue = new LinkableResult<T>();
        newValue.maxId = value.maxId;
        newValue.minId = value.minId;
        newValue.data = [...value.data];

        newValue.context = value.context;
        newValue.hashtag = value.hashtag;
        newValue.category = value.category;
        newValue.user = value.user;

        return newValue;
    }
}
