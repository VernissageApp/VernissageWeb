export class BusinessCardField {
    public id?: string;
    public key = '';
    public value = '';

    constructor(id: string | undefined, key: string, value: string) {
        this.id = id;
        this.key = key;
        this.value = value;
    }
}
