import { ChangeDetectionStrategy, Component, ElementRef, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import QRCodeStyling from 'qr-code-styling';
import { TwoFactorToken } from 'src/app/models/two-factor-token';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'app-enable-two-factor-token-dialog',
    templateUrl: 'enable-two-factor-token.dialog.html',
    styleUrls: ['enable-two-factor-token.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EnableTwoFactorTokenDialog implements OnInit {
    protected twoFactorToken = signal<TwoFactorToken | undefined>(undefined);
    protected code = model('');

    private qrCode?: QRCodeStyling;
    private canvas = viewChild<ElementRef<HTMLCanvasElement> | undefined>('canvas');
    
    private accountService = inject(AccountService);
    private messageService = inject(MessagesService);
    private dialogRef = inject(MatDialogRef<EnableTwoFactorTokenDialog>);

    async ngOnInit(): Promise<void> {
        const downloadedToken = await this.accountService.getTwoFactorToken();
        this.twoFactorToken.set(downloadedToken);

            this.qrCode = new QRCodeStyling({
                width: 180,
                height: 180,
                type: 'svg',
                data: downloadedToken.url,
                margin: 0,
                qrOptions: {
                    typeNumber: 0,
                    mode: 'Byte',
                    errorCorrectionLevel: 'Q'
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 20,
                    crossOrigin: 'anonymous',
                },
                dotsOptions: {
                    color: '#000000',
                    type: 'rounded'
                },
                backgroundOptions: {
                    color: '#ffffff'
                },
                cornersSquareOptions: {
                    color: '#000000',
                    type: 'extra-rounded'
                },
                cornersDotOptions: {
                    color: '#000000',
                    type: 'dot'
                }
            });
          
            const internalCanvas = this.canvas();
            if (internalCanvas) {
                this.qrCode.append(internalCanvas.nativeElement);
            }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            await this.accountService.enableTwoFactorToken(this.code());
            this.messageService.showSuccess('Two factor authentication enabled.');
            this.dialogRef.close({});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}