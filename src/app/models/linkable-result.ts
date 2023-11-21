import { ContextTimeline } from "./context-timeline";

export class LinkableResult<T>  {
    public maxId?: string;
    public minId?: string;
    public data: T[] = [];
    public context = ContextTimeline.unknown;
}
