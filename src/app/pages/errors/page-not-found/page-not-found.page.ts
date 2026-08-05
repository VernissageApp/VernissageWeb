import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { RESPONSE } from 'express.tokens';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.page.html',
    styleUrls: ['./page-not-found.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, RouterLink, MatProgressBar, TranslatePipe]
})
export class PageNotFoundPage implements OnInit, OnDestroy {
    protected value = signal(100);
    private interval: NodeJS.Timeout | undefined;

    private platformId = inject(PLATFORM_ID);
    private response = inject(RESPONSE, { optional: true });
    private router = inject(Router);

    ngOnInit(): void {
        this.response?.status(404);

        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.interval = setInterval(async ()=> {
            this.value.update(progress => {
                progress = progress - 10;
                if (progress < 0) {
                    this.router.navigate(['/']);
                }

                return progress;
            });
        }, 500);
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
