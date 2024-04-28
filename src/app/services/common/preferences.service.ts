import { Injectable } from '@angular/core';
import { PersistanceService } from '../persistance/persistance.service';
import { CookieService } from 'ngx-cookie';

@Injectable({
    providedIn: 'root'
})
export class PreferencesService {

    constructor(private cookieService: CookieService) {
    }

    public get isLightTheme(): boolean {
        return (this.cookieService.get('isLightTheme') ?? 'true') === 'true';
    }

    public set isLightTheme(isLightTheme: boolean) {
        this.cookieService.put('isLightTheme', isLightTheme ? 'true' : 'false');
    }

    public get isCircleAvatar(): boolean {
        return (this.cookieService.get('isCircleAvatar') ?? 'false') === 'true';
    }

    public set isCircleAvatar(isCircleAvatar: boolean) {
        this.cookieService.put('isCircleAvatar', isCircleAvatar ? 'true' : 'false');
    }

    public get alwaysShowNSFW(): boolean {
        return (this.cookieService.get('alwaysShowNSFW') ?? 'false') === 'true';
    }

    public set alwaysShowNSFW(alwaysShowNSFW: boolean) {
        this.cookieService.put('alwaysShowNSFW', alwaysShowNSFW ? 'true' : 'false');
    }

    public get showAlternativeText(): boolean {
        return (this.cookieService.get('showAlternativeText') ?? 'false') === 'true';
    }

    public set showAlternativeText(showAlternativeText: boolean) {
        this.cookieService.put('showAlternativeText', showAlternativeText ? 'true' : 'false');
    }

    public get showAvatars(): boolean {
        return (this.cookieService.get('showAvatars') ?? 'false') === 'true';
    }

    public set showAvatars(showAvatars: boolean) {
        this.cookieService.put('showAvatars', showAvatars ? 'true' : 'false');
    }

    public get showFavourites(): boolean {
        return (this.cookieService.get('showFavourites') ?? 'false') === 'true';
    }

    public set showFavourites(showFavourites: boolean) {
        this.cookieService.put('showFavourites', showFavourites ? 'true' : 'false');
    }

    public get showAltIcon(): boolean {
        return (this.cookieService.get('showAltIcon') ?? 'false') === 'true';
    }

    public set showAltIcon(showAltIcon: boolean) {
        this.cookieService.put('showAltIcon', showAltIcon ? 'true' : 'false');
    }
}
