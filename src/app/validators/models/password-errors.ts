export class PasswordErrors {
    public length = true;
    public lowercase = true;
    public uppercase = true;
    public symbol = true;

    public isValid(): boolean {
        return !this.length && !this.lowercase && !this.uppercase && !this.symbol;
    }
}
