import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { decode } from 'blurhash';
import { PersistanceService } from 'src/app/services/persistance/persistance.service';

@Component({
    selector: 'app-blurhash-image',
    templateUrl: './blurhash-image.component.html',
    styleUrls: ['./blurhash-image.component.scss']
})
export class BlurhashImageComponent implements AfterViewInit {
    @Input() imageSrc?: string;
    @Input() blurhash?: string;
    @Input() text?: string;
    @Input() horizontal = true;

    @ViewChild('canvas', { static: false }) readonly canvas?: ElementRef<HTMLCanvasElement>;
    @ViewChild('img', { static: false }) readonly img?: ElementRef<HTMLImageElement>;

    showBlurhash = true;

    constructor(private persistanceService: PersistanceService) {
    }

    ngOnInit(): void {
        const alwaysShowNSFW = this.persistanceService.get('alwaysShowNSFW');
        if (alwaysShowNSFW === 'true') {
            this.showBlurhash = false
        }
    }

    ngAfterViewInit(): void {
        if (this.showBlurhash) {
            this.drawCanvas();
        }
    }

    private drawCanvas(): void {
        if (!this.blurhash) {
            return;
        }

        if (!this.canvas) {
            return;
        }

        const pixels = decode(this.blurhash, 32, 32);
        const ctx = this.canvas.nativeElement.getContext('2d');

        if (!ctx) {
            return;
        }

        const imageData = ctx.createImageData(32, 32);
        if (!imageData) {
            return;
        }

        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);
    }
}
