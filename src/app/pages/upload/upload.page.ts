import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-upload',
    templateUrl: './upload.page.html',
    styleUrls: ['./upload.page.scss'],
    animations: fadeInAnimation
})
export class UploadPage {
}
