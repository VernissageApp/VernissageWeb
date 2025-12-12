import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';

@Component({
    selector: 'app-frequently-asked-questions',
    templateUrl: './frequently-asked-questions.page.html',
    styleUrls: ['./frequently-asked-questions.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FrequentlyAskedQuestionsPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);

    override ngOnInit(): void {
        this.isReady.set(true);
    }
}
