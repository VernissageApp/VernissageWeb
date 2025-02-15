import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name:'ago',
	standalone: false
})
export class AgoPipe implements PipeTransform {
    private readonly intervals: Record<string, number> = {
        'day': 86400,
        'hour': 3600,
        'minute': 60,
        'second': 1
    };


    transform(value: any): any {
        if (value) {
            const currentDate = new Date();
            const displayedDate = new Date(value);

            if (displayedDate.toString() === 'Invalid Date') {
                return ''
            }

            const seconds = Math.floor((currentDate.getTime() - displayedDate.getTime()) / 1000);
            if (seconds < 59) {
                return 'few seconds ago';
            }

            let counter;
            for (const interval in this.intervals) {
                counter = Math.floor(seconds / this.intervals[interval]);
                if (counter > 0) {
                    if (counter === 1) {
                        return `${counter} ${interval} ago`;
                    } else {
                        return `${counter} ${interval}s ago`;
                    }
                }
            }
        }

        return '';
    }
}