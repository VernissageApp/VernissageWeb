import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BusinessCardField } from 'src/app/models/business-card-field';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-business-card',
    templateUrl: './business-card.component.html',
    styleUrls: ['./business-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BusinessCardComponent extends ResponsiveComponent {
    public fields = input.required<BusinessCardField[]>();
    public title = input.required<string>();
    public avatarUrl = input.required<string>();

    public subtitle = input<string>('');
    public body = input<string>('');
    public website = input<string>('');
    public telephone = input<string>('');
    public email = input<string>('');
    public color1 = input<string>('#ad5389');
    public color2 = input<string>('#3c1053');
    public color3 = input<string>('#ffffff');
    public sharedBusinessCardCode = input<string>('');
    public userName = input<string>('');

    private windowService = inject(WindowService);

    protected async onImportContact(): Promise<void> {
        let vCardData = '';
        vCardData += 'BEGIN:VCARD\n';
        vCardData += 'VERSION:4.0\n';
        vCardData += `FN;CHARSET=utf-8:${this.title()}\n`;
        vCardData += `URL:${this.windowService.getApplicationBaseUrl()}/cards/${this.sharedBusinessCardCode()}\n`;
        vCardData += `URL:${this.windowService.getApplicationBaseUrl()}/@${this.userName()}\n`;

        if (this.website()) {
            vCardData += `URL:${this.website()}\n`;
        }
        
        if (this.telephone()) {
            vCardData += `TEL;TYPE=CELL:${this.telephone()}\n`;
        }

        if (this.email()) {
            vCardData += `EMAIL:${this.email()}\n`;
        }

        if (this.body()) {
            vCardData += `NOTE;CHARSET=utf-8:${this.body().replaceAll('\n', '\\n')}\n`;
        }

        const internalAvatarUrl = this.downloadAvatarBase64()
        if (internalAvatarUrl) {
            vCardData += `PHOTO;ENCODING=b;TYPE=PNG:${internalAvatarUrl}\n`;
        }

        vCardData += 'END:VCARD';
    
        // Prepare blob with vcard.
        const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
    
        // Create a link and trigger download.
        const a = document.createElement('a');
        a.href = url;
        a.download = this.title() + '.vcf';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
    
        // Remove code from DOM.
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    private downloadAvatarBase64(): string | undefined {
        return undefined;
    }
}
