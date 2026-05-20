import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LocalizedTitleStrategy extends TitleStrategy {
    private readonly title = inject(Title);
    private readonly translateService = inject(TranslateService);
    private latestSnapshot?: RouterStateSnapshot;

    constructor() {
        super();

        this.translateService.onLangChange.subscribe(() => {
            if (this.latestSnapshot) {
                this.updateTitle(this.latestSnapshot);
            }
        });
    }

    override updateTitle(snapshot: RouterStateSnapshot): void {
        this.latestSnapshot = snapshot;

        const title = this.buildTitle(snapshot);
        if (title) {
            this.title.setTitle(this.translateService.instant(title));
        }
    }
}
