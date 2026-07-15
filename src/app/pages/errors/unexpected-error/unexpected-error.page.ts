import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersistenceService } from 'src/app/services/persistance/persistance.service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelContent } from '@angular/material/expansion';
import { MatFormField } from '@angular/material/form-field';
import { InputActivityDirective } from '../../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-unexpected-error',
    templateUrl: './unexpected-error.page.html',
    styleUrls: ['./unexpected-error.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, RouterLink, MatProgressBar, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelContent, MatFormField, InputActivityDirective, MatInput, TranslatePipe]
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
