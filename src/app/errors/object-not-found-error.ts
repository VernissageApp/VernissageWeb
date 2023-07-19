export class ObjectNotFoundError {
    constructor(public objectId: any) {
        this.objectId = objectId;
    }
}
