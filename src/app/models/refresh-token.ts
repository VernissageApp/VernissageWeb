export class RefreshToken {
    public refreshToken: string;
    public regenerateRefreshToken = true;
    public useCookies = true;

    constructor(refreshToken: string, regenerateRefreshToken: boolean) {
        this.refreshToken = refreshToken;
        this.regenerateRefreshToken = regenerateRefreshToken;
    }
}
