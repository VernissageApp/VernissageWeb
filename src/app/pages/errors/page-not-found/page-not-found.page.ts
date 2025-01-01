import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.page.html',
    styleUrls: ['./page-not-found.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class PageNotFoundPage implements OnInit, OnDestroy {
    value = 100;
    interval: any;

    constructor(private router: Router) {
    }

    async ngOnInit(): Promise<void> {
        this.interval = setInterval(async ()=> {
            this.value = this.value - 4;
            if (this.value < 0) {
                await this.router.navigate(['/']);
            }
        }, 200);
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
