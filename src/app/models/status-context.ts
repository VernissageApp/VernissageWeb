import { Status } from "./status"

export class StatusContext {
    public ancestors: Status[] = []
    public descendants: Status[] = []
}
