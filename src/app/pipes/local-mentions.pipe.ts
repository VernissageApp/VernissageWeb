import { DOCUMENT, inject, Pipe, PipeTransform } from '@angular/core';
import { WindowService } from '../services/common/window.service';

@Pipe({
    name: 'localMentions'
})
export class LocalMentionsPipe implements PipeTransform {
    private readonly document = inject(DOCUMENT);
    private readonly domain = new URL(inject(WindowService).getApplicationBaseUrl()).hostname.toLowerCase();

    transform(html: string): string {
        const template = this.document.createElement('template');

        template.innerHTML = html;

        for (const link of Array.from(template.content.querySelectorAll('a'))) {
            const mention = link.textContent?.match(/^@([^@\s]+)@([^@\s]+)$/);

            if (mention && mention[2].toLowerCase() === this.domain) {
                // Shorten only the visible label; keep the original profile URL.
                link.textContent = `@${mention[1]}`;
            }
        }

        // Angular still sanitizes this string when binding it to innerHTML.
        return template.innerHTML;
    }
}
