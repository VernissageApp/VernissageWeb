import { ContextTimeline } from "./context-timeline";

export class LinkableResult<T>  {
    public maxId?: string;
    public minId?: string;
    public data: T[] = [];

    public context = ContextTimeline.unknown;
    public hashtag?: string;
    public category?: string;
    public camera?: string;
    public lens?: string;
    public film?: string;
    public user?: string;

    public static copy<T>(value: LinkableResult<T>): LinkableResult<T> {
        const newValue = new LinkableResult<T>();
        newValue.maxId = value.maxId;
        newValue.minId = value.minId;
        newValue.data = [...value.data];

        newValue.context = value.context;
        newValue.hashtag = value.hashtag;
        newValue.category = value.category;
        newValue.camera = value.camera;
        newValue.lens = value.lens;
        newValue.film = value.film;
        newValue.user = value.user;

        return newValue;
    }
}
