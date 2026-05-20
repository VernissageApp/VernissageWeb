import { inject, Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
	name:'ago',
	standalone: false
})
export class AgoPipe implements PipeTransform {
    private readonly intervals: { unit: Intl.RelativeTimeFormatUnitSingular; seconds: number }[] = [
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
    ];

    private translateService = inject(TranslateService);

    transform(value: any): any {
        if (value) {
            const currentDate = new Date();
            const displayedDate = new Date(value);

            if (displayedDate.toString() === 'Invalid Date') {
                return ''
            }

            const seconds = Math.floor((currentDate.getTime() - displayedDate.getTime()) / 1000);
            if (seconds < 59) {
                return this.translateService.instant('common.timeAgo.fewSecondsAgo');
            }

            for (const interval of this.intervals) {
                const counter = Math.floor(seconds / interval.seconds);
                if (counter > 0) {
                    const formatter = new Intl.RelativeTimeFormat(this.translateService.getCurrentLang() || 'en', { numeric: 'auto' });
                    return formatter.format(-counter, interval.unit);
                }
            }
        }

        return '';
    }
}
