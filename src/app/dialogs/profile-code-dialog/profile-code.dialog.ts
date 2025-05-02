import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import QRCodeStyling from 'qr-code-styling';

@Component({
    selector: 'app-profile-code-dialog',
    templateUrl: 'profile-code.dialog.html',
    styleUrls: ['profile-code.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProfileCodeDialog implements OnInit {
    protected profileUrl = signal('');
    protected isLightTheme = signal(false);

    private qrCode?: QRCodeStyling;
    private canvas = viewChild<ElementRef<HTMLCanvasElement> | undefined>('canvas');
    private data?: string = inject(MAT_DIALOG_DATA);
    
    ngOnInit(): void {
        if (this.data) {
            this.profileUrl.set(this.data);

            this.qrCode = new QRCodeStyling({
                width: 280,
                height: 280,
                type: 'svg',
                data: this.data,
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
    }
}
