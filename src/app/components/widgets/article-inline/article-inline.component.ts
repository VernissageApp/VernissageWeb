import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { Article } from 'src/app/models/article';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-article-inline',
    templateUrl: './article-inline.component.html',
    styleUrls: ['./article-inline.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ArticleInlineComponent extends ResponsiveComponent {
    public article = input.required<Article>();
    public dismiss = output<Article>();
    
    protected showDismissButton = computed(() => {
        return !!this.authorizationService.getUser();
    });

    protected userDisplayService = inject(UserDisplayService);
    protected authorizationService = inject(AuthorizationService);

    protected onDismissClick(): void {
        this.dismiss.emit(this.article());
    }
}
