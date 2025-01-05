import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-access-forbidden',
    templateUrl: './access-forbidden.page.html',
    styleUrls: ['./access-forbidden.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class AccessForbiddenPage implements OnInit, OnDestroy {
    protected value = signal(100);
    private interval: NodeJS.Timeout | undefined;

    constructor(private router: Router) {
    }

    async ngOnInit(): Promise<void> {
        this.interval = setInterval(async ()=> {
            this.value.update(progress => {
                progress = progress - 4;
                if (progress < 0) {
                    this.router.navigate(['/']);
                }

                return progress;
            });
        }, 200);
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
