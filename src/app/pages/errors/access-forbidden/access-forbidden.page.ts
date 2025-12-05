import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-access-forbidden',
    templateUrl: './access-forbidden.page.html',
    styleUrls: ['./access-forbidden.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AccessForbiddenPage implements OnInit, OnDestroy {
    protected value = signal(100);
    private interval: NodeJS.Timeout | undefined;

    private router = inject(Router);

    async ngOnInit(): Promise<void> {
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
