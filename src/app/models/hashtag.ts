export class Hashtag {
    public url: string;
    public name: string;
    public amount?: number;

    constructor(url: string, name: string, amount?: number) {
        this.url = url;
        this.name = name;
        this.amount = amount;
    }
}
