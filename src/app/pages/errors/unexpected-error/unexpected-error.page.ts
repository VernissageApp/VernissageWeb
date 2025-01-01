import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { PersistanceService } from 'src/app/services/persistance/persistance.service';

@Component({
    selector: 'app-unexpected-error',
    templateUrl: './unexpected-error.page.html',
    styleUrls: ['./unexpected-error.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class UnexpectedErrorPage implements OnInit, OnDestroy {
    value = 100;
    errorExpanded = false;
    interval: any;
    errorMessage?: string;
    code?: string;

    constructor(
        private persistanceService: PersistanceService,
        private router: Router,
        private activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        const codeFromQuery = this.activatedRoute.snapshot.queryParamMap.get('code');
        if (codeFromQuery) {
            this.code = codeFromQuery;
        }

        this.interval = setInterval(async ()=> {
            if (this.errorExpanded) {
                if (this.interval) {
                    clearInterval(this.interval);
                }

                return;
            }

            this.value = this.value - 4;
            if (this.value < 0) {
                await this.router.navigate(['/']);
            }
        }, 200);

        const errorObject = this.persistanceService.get('exception');
        if (errorObject) {
            this.errorMessage = errorObject.toString();
            this.persistanceService.remove('exception');
        }
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    onAfterExpand(): void {
        this.errorExpanded = true;
        this.value = 100;
    }
}
