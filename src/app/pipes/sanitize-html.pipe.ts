import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizeHtml',
    standalone: false
})
export class SanitizeHtmlPipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);

    transform(value: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}
