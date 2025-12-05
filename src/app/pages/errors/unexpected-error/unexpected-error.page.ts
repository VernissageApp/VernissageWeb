import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PersistenceService } from 'src/app/services/persistance/persistance.service';

@Component({
    selector: 'app-unexpected-error',
    templateUrl: './unexpected-error.page.html',
    styleUrls: ['./unexpected-error.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UnexpectedErrorPage implements OnInit, OnDestroy {
    protected value = signal(100);
    protected errorMessage = signal<string | undefined>(undefined);
    protected code = signal<string | undefined>(undefined);

    private errorExpanded = false;
    private interval: NodeJS.Timeout | undefined;

    private persistenceService = inject(PersistenceService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        const codeFromQuery = this.activatedRoute.snapshot.queryParamMap.get('code');
        if (codeFromQuery) {
            this.code.set(codeFromQuery);
        }

        this.interval = setInterval(async ()=> {
            if (this.errorExpanded) {
                if (this.interval) {
                    clearInterval(this.interval);
                }

                return;
            }

            this.value.update(progress => {
                progress = progress - 10;
                if (progress < 0) {
                    this.router.navigate(['/']);
                }

                return progress;
            });
        }, 500);

        const errorObject = this.persistenceService.get('exception');
        if (errorObject) {
            this.errorMessage.set(errorObject.toString());
            this.persistenceService.remove('exception');
        }
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    protected onAfterExpand(): void {
        this.errorExpanded = true;
        this.value.set(100);
    }
}
