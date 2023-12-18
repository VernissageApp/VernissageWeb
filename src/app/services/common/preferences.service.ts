import { Injectable } from '@angular/core';
import { PersistanceService } from '../persistance/persistance.service';

@Injectable({
    providedIn: 'root'
})
export class PreferencesService {

    constructor(private persistanceService: PersistanceService) {
    }

    public get isLightTheme(): boolean {
        return (this.persistanceService.get('isLightTheme') ?? 'true') === 'true';
    }

    public set isLightTheme(isLightTheme: boolean) {
        this.persistanceService.set('isLightTheme', isLightTheme ? 'true' : 'false');
    }

    public get isCircleAvatar(): boolean {
        return (this.persistanceService.get('isCircleAvatar') ?? 'false') === 'true';
    }

    public set isCircleAvatar(isCircleAvatar: boolean) {
        this.persistanceService.set('isCircleAvatar', isCircleAvatar ? 'true' : 'false');
    }

    public get alwaysShowNSFW(): boolean {
        return (this.persistanceService.get('alwaysShowNSFW') ?? 'false') === 'true';
    }

    public set alwaysShowNSFW(alwaysShowNSFW: boolean) {
        this.persistanceService.set('alwaysShowNSFW', alwaysShowNSFW ? 'true' : 'false');
    }

    public get showAlternativeText(): boolean {
        return (this.persistanceService.get('showAlternativeText') ?? 'false') === 'true';
    }

    public set showAlternativeText(showAlternativeText: boolean) {
        this.persistanceService.set('showAlternativeText', showAlternativeText ? 'true' : 'false');
    }

    public get showAvatars(): boolean {
        return (this.persistanceService.get('showAvatars') ?? 'false') === 'true';
    }

    public set showAvatars(showAvatars: boolean) {
        this.persistanceService.set('showAvatars', showAvatars ? 'true' : 'false');
    }

    public get showFavourites(): boolean {
        return (this.persistanceService.get('showFavourites') ?? 'false') === 'true';
    }

    public set showFavourites(showFavourites: boolean) {
        this.persistanceService.set('showFavourites', showFavourites ? 'true' : 'false');
    }

    public get showAltIcon(): boolean {
        return (this.persistanceService.get('showAltIcon') ?? 'false') === 'true';
    }

    public set showAltIcon(showAltIcon: boolean) {
        this.persistanceService.set('showAltIcon', showAltIcon ? 'true' : 'false');
    }
}
