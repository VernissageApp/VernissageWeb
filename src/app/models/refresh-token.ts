export class RefreshToken {
    public refreshToken: string;
    public regenerateRefreshToken = true;
    public useCookies: boolean;

    constructor(refreshToken: string, regenerateRefreshToken: boolean, useCookies = true) {
        this.refreshToken = refreshToken;
        this.regenerateRefreshToken = regenerateRefreshToken;
        this.useCookies = useCookies;
    }
}
