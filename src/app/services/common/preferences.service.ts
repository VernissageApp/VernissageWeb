import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';

// We are storing preferences in the cookies instead of local storage because of
// Server Side Rendering. The cookies are send to server even with the first browser
// request, and server knows how the page should look like (theme/avatars etc.)
// and we will get page rendered according to user preferences.
@Injectable({
    providedIn: 'root'
})
export class PreferencesService {
    private readonly longFuture = 'Sat, 01 Jan 2050 00:00:00 GMT';

    constructor(private cookieService: CookieService) {
    }

    public get isLightTheme(): boolean {
        return (this.cookieService.get('isLightTheme') ?? 'true') === 'true';
    }

    public set isLightTheme(isLightTheme: boolean) {
        this.cookieService.put('isLightTheme', isLightTheme ? 'true' : 'false', { expires: this.longFuture });
    }

    public get isCircleAvatar(): boolean {
        return (this.cookieService.get('isCircleAvatar') ?? 'false') === 'true';
    }

    public set isCircleAvatar(isCircleAvatar: boolean) {
        this.cookieService.put('isCircleAvatar', isCircleAvatar ? 'true' : 'false', { expires: this.longFuture });
    }

    public get isSquareImages(): boolean {
        return (this.cookieService.get('isSquareImages') ?? 'true') === 'true';
    }

    public set isSquareImages(isSquareImages: boolean) {
        this.cookieService.put('isSquareImages', isSquareImages ? 'true' : 'false', { expires: this.longFuture });
    }

    public get alwaysShowNSFW(): boolean {
        return (this.cookieService.get('alwaysShowNSFW') ?? 'false') === 'true';
    }

    public set alwaysShowNSFW(alwaysShowNSFW: boolean) {
        this.cookieService.put('alwaysShowNSFW', alwaysShowNSFW ? 'true' : 'false', { expires: this.longFuture });
    }

    public get showAlternativeText(): boolean {
        return (this.cookieService.get('showAlternativeText') ?? 'false') === 'true';
    }

    public set showAlternativeText(showAlternativeText: boolean) {
        this.cookieService.put('showAlternativeText', showAlternativeText ? 'true' : 'false', { expires: this.longFuture });
    }

    public get showAvatars(): boolean {
        return (this.cookieService.get('showAvatars') ?? 'false') === 'true';
    }

    public set showAvatars(showAvatars: boolean) {
        this.cookieService.put('showAvatars', showAvatars ? 'true' : 'false', { expires: this.longFuture });
    }

    public get showFavourites(): boolean {
        return (this.cookieService.get('showFavourites') ?? 'false') === 'true';
    }

    public set showFavourites(showFavourites: boolean) {
        this.cookieService.put('showFavourites', showFavourites ? 'true' : 'false', { expires: this.longFuture });
    }

    public get showAltIcon(): boolean {
        return (this.cookieService.get('showAltIcon') ?? 'false') === 'true';
    }

    public set showAltIcon(showAltIcon: boolean) {
        this.cookieService.put('showAltIcon', showAltIcon ? 'true' : 'false', { expires: this.longFuture });
    }
}
