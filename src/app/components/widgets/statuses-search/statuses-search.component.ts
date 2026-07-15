import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Status } from 'src/app/models/status';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { RouterLink } from '@angular/router';
import { BlurhashImageComponent } from '../blurhash-image/blurhash-image.component';
import { ImageComponent } from '../image/image.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { HrefToRouterLinkDirective } from '../../../directives/href-to-router-link.directive';
import { NoteProcessorDirective } from '../../../directives/note-processor.directive';
import { StatusPropertiesComponent } from '../status-properties/status-properties.component';

@Component({
    selector: 'app-statuses-search',
    templateUrl: './statuses-search.component.html',
    styleUrls: ['./statuses-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, BlurhashImageComponent, ImageComponent, UserCardComponent, HrefToRouterLinkDirective, NoteProcessorDirective, StatusPropertiesComponent]
})
export class StatusesSearchComponent extends ResponsiveComponent implements OnInit {
    public status = input.required<Status>();

    protected alwaysShowNSFW = signal(false);
    protected mainStatus = computed(() => this.status().reblog ?? this.status());
    protected rendered = computed<SafeHtml>(() => this.mainStatus()?.noteHtml ?? '');

    private preferencesService = inject(PreferencesService);

    override ngOnInit(): void {
        super.ngOnInit();

        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
    }
}
