import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { encode } from 'blurhash';
import * as ExifReader from 'exifreader';
import { StatusRequest } from 'src/app/models/status-request';
import { StatusVisibility } from 'src/app/models/status-visibility';

import { TemporaryAttachment } from 'src/app/models/temporary-attachment';
import { UploadPhoto } from 'src/app/models/upload-photo';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AttachmentsService } from 'src/app/services/http/attachments.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { fadeInAnimation } from '../../animations/fade-in.animation';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.page.html',
    styleUrls: ['./upload.page.scss'],
    animations: fadeInAnimation
})
export class UploadPage implements OnInit {
    readonly StatusVisibility = StatusVisibility;

    statusText = '';
    visibility = StatusVisibility.Public;

    commentsDisabled = false;
    isSensitive = false;
    contentWarning = '';
    selectedIndex = 0;

    photos: UploadPhoto[] = [];

    constructor(private messageService: MessagesService,
                private attachmentsService: AttachmentsService,
                private statusesService: StatusesService,
                private router: Router) {
    }

    ngOnInit(): void {
    }

    async onPhotoSelected(event: any): Promise<void> {
        try {
            const uploadPhoto = new UploadPhoto(event.target.files[0]);
            this.photos.push(uploadPhoto);

            this.setPhotoData(uploadPhoto);
            this.setExifMetadata(uploadPhoto);

            const formData = new FormData();
            formData.append('file', uploadPhoto.photoFile);
            const temporaryAttachment = await this.attachmentsService.uploadAttachment(formData);

            uploadPhoto.id = temporaryAttachment.id;
            uploadPhoto.isUploaded = true;
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    onPhotoDelete(photo: UploadPhoto): void {
        const index = this.photos.indexOf(photo, 0);
        if (index > -1) {
            this.photos.splice(index, 1);
        }
    }

    protected allPhotosUploaded(): boolean {
        return !this.photos.some(x => !x.isUploaded);
    }

    async onSubmit(): Promise<void> {
        try {
            for(let photo of this.photos) {
                const temporaryAttachment = new TemporaryAttachment();
                temporaryAttachment.id = photo.id;
                temporaryAttachment.description = photo.description;
                temporaryAttachment.blurhash = photo.blurhash;

                temporaryAttachment.make = photo.make
                temporaryAttachment.model = photo.model
                temporaryAttachment.lens = photo.lens
                temporaryAttachment.createDate = photo.createDate
                temporaryAttachment.focalLenIn35mmFilm = photo.focalLenIn35mmFilm
                temporaryAttachment.fNumber = photo.fNumber
                temporaryAttachment.exposureTime = photo.exposureTime
                temporaryAttachment.photographicSensitivity = photo.photographicSensitivity
                temporaryAttachment.locationId = photo.locationId;

                await this.attachmentsService.updateAttachment(temporaryAttachment);
            }

            const status = new StatusRequest();
            status.note = this.statusText;
            status.visibility = StatusVisibility.Public;
            status.commentsDisabled = this.commentsDisabled;
            status.sensitive = this.isSensitive;
            status.contentWarning = this.contentWarning === '' ? undefined : this.contentWarning;

            for(let photo of this.photos) {
                status.attachmentIds.push(photo.id);
            }

            await this.statusesService.create(status)

            this.messageService.showSuccess('Status has been saved.');
            await this.router.navigate(['/']);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private setPhotoData(uploadPhoto: UploadPhoto): void {
        const reader = new FileReader();

        reader.onload = async () => {
            uploadPhoto.photoSrc = reader.result as string;
            uploadPhoto.blurhash = await this.encodeImageToBlurhash(uploadPhoto.photoSrc);
        }

        reader.readAsDataURL(uploadPhoto.photoFile);
    }

    private setExifMetadata(uploadPhoto: UploadPhoto): void {
        const bufferReader = new FileReader();

        bufferReader.addEventListener('load', fileReaderEvent => {
            const tags = ExifReader.load(bufferReader.result as ArrayBuffer);

            uploadPhoto.make = tags['Make']?.description.toString();
            uploadPhoto.model = tags['Model']?.description.toString();
            uploadPhoto.lens = tags['Lens']?.description.toString();
            uploadPhoto.createDate = tags['CreateDate']?.description.toString();
            uploadPhoto.focalLenIn35mmFilm = tags['FocalLengthIn35mmFilm']?.description.toString();
            uploadPhoto.fNumber = tags['FNumber']?.description.toString();
            uploadPhoto.exposureTime = tags['ExposureTime']?.description.toString();
            uploadPhoto.photographicSensitivity = tags['ISOSpeedRatings']?.description.toString();
        });

        bufferReader.readAsArrayBuffer(uploadPhoto.photoFile);
    }

    private loadImage(src: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = (...args) => reject(args);
            image.src = src;
        });
    }

    private getImageData(image: any): ImageData | unknown {
        const canvas = document.createElement("canvas");
        canvas.width = image.width / 8;
        canvas.height = image.height / 8;
        const context = canvas.getContext("2d");
        context?.drawImage(image, 0, 0, canvas.width, canvas.height);

        return context?.getImageData(0, 0, canvas.width, canvas.height);
    }

    private async encodeImageToBlurhash(imageUrl: string): Promise<string> {
        const image = await this.loadImage(imageUrl);
        const imageData = this.getImageData(image) as ImageData;
        if (imageData) {
            return encode(imageData.data, imageData.width, imageData.height, 4, 4);
        } else {
            return '';
        }
    }
}
