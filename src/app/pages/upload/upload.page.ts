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
import { CategoriesService } from 'src/app/services/http/categories.service';
import { Category } from 'src/app/models/category';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { License } from 'src/app/models/license';
import { LicensesService } from 'src/app/services/http/liceses.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.page.html',
    styleUrls: ['./upload.page.scss'],
    animations: fadeInAnimation
})
export class UploadPage extends ResponsiveComponent implements OnInit {
    readonly StatusVisibility = StatusVisibility;
    readonly defaultMaxFileSize = 10485760;
    
    categories: Category[] = [];
    licenses: License[] = [];
    statusText = '';
    categoryId?: string;
    visibility = StatusVisibility.Public;
    commentsDisabled = false;
    isSensitive = false;
    contentWarning = '';
    selectedIndex = 0;
    isOpenAIEnabled = false;
    hashtagsInProgress = false;
    maxFileSize = 0;
    maxStatusLength = 0;

    photos: UploadPhoto[] = [];

    constructor(
        private messageService: MessagesService,
        private attachmentsService: AttachmentsService,
        private categoriesService: CategoriesService,
        private licensesService: LicensesService,
        private statusesService: StatusesService,
        private instanceService: InstanceService,
        private router: Router,
        private settingsService: SettingsService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.maxFileSize = this.instanceService.instance?.configuration?.attachments?.imageSizeLimit ?? this.defaultMaxFileSize;
        this.maxStatusLength = this.instanceService.instance?.configuration?.statuses?.maxCharacters ?? 500;
        this.isOpenAIEnabled = this.settingsService.publicSettings?.isOpenAIEnabled ?? false;

        [this.categories, this.licenses] = await Promise.all([
            this.categoriesService.all(),
            this.licensesService.all()
        ]);
    }

    async onPhotoSelected(event: any): Promise<void> {
        try {
            const file = event.target.files[0];
            if (file.size > this.maxFileSize) {
                this.messageService.showError('Uploaded file is too large. Maximum size is 10mb.');
                return;
            }

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

    async onGenerateHashtags(): Promise<void> {
        try {
            if (this.photos.length === 0) {
                return;
            }

            this.hashtagsInProgress = true;
            const attachmentHashtags = await this.attachmentsService.hashtags(this.photos[0].id);
            if (attachmentHashtags.hashtags && attachmentHashtags.hashtags.length > 0) {
                const hashtags = attachmentHashtags.hashtags.map(tag => '#' + tag);
                this.statusText = this.statusText + '\n\n' + hashtags.join(' ');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.hashtagsInProgress = false;
        }
    }

    protected allPhotosUploaded(): boolean {
        return !this.photos.some(x => !x.isUploaded || (x.photoHdrFile && !x.isHdrUploaded));
    }

    async onSubmit(): Promise<void> {
        try {
            for (const photo of this.photos) {
                const temporaryAttachment = new TemporaryAttachment();
                temporaryAttachment.id = photo.id;
                temporaryAttachment.description = photo.description;
                temporaryAttachment.blurhash = photo.blurhash;

                if (photo.showMake) {
                    temporaryAttachment.make = photo.make;
                }

                if (photo.showModel) {
                    temporaryAttachment.model = photo.model;
                }

                if (photo.showLens) {
                    temporaryAttachment.lens = photo.lens;
                }

                if (photo.showCreateDate) {
                    temporaryAttachment.createDate = photo.createDate?.toISOString();
                }

                if (photo.showFocalLenIn35mmFilm) {
                    temporaryAttachment.focalLenIn35mmFilm = photo.focalLenIn35mmFilm;
                }
                
                if (photo.showFNumber && photo.fNumber) {
                    temporaryAttachment.fNumber = `f/${photo.fNumber}`;
                }

                if (photo.showExposureTime) {
                    temporaryAttachment.exposureTime = photo.exposureTime;
                }

                if (photo.showPhotographicSensitivity) {
                    temporaryAttachment.photographicSensitivity = photo.photographicSensitivity;
                }

                if (photo.showSoftware) {
                    temporaryAttachment.software = photo.software;
                }

                if (photo.showFilm) {
                    temporaryAttachment.film = photo.film;
                }

                if (photo.showChemistry) {
                    temporaryAttachment.chemistry = photo.chemistry;
                }

                if (photo.showScanner) {
                    temporaryAttachment.scanner = photo.scanner;
                }

                if (photo.showGpsCoordination) {
                    temporaryAttachment.latitude = photo.latitude;
                    temporaryAttachment.longitude = photo.longitude;
                }

                temporaryAttachment.locationId = photo.locationId;
                temporaryAttachment.licenseId = photo.licenseId;

                await this.attachmentsService.updateAttachment(temporaryAttachment);
            }

            const status = new StatusRequest();
            status.note = this.statusText;
            status.categoryId = this.categoryId;
            status.visibility = StatusVisibility.Public;
            status.commentsDisabled = this.commentsDisabled;
            status.sensitive = this.isSensitive;
            status.contentWarning = this.contentWarning === '' ? undefined : this.contentWarning;

            for (const photo of this.photos) {
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

        bufferReader.addEventListener('load', () => {
            const tags = ExifReader.load(bufferReader.result as ArrayBuffer);

            const make = tags['Make']?.description.toString();
            if (make) {
                uploadPhoto.make = make;
                uploadPhoto.showMake = true;
            }

            const model = tags['Model']?.description.toString();
            if (model) {
                uploadPhoto.model = model;
                uploadPhoto.showModel = true;
            }

            const lens = tags['Lens']?.description.toString();
            if (lens) {
                uploadPhoto.lens = lens;
                uploadPhoto.showLens = true;
            }

            const focalLenIn35mmFilm = tags['FocalLengthIn35mmFilm']?.description.toString();
            if (focalLenIn35mmFilm) {
                uploadPhoto.focalLenIn35mmFilm = focalLenIn35mmFilm;
                uploadPhoto.showFocalLenIn35mmFilm = true;
            }

            const exposureTime = tags['ExposureTime']?.description.toString();
            if (exposureTime) {
                uploadPhoto.exposureTime = exposureTime;
                uploadPhoto.showExposureTime = true;
            }

            const photographicSensitivity = tags['ISOSpeedRatings']?.description.toString();
            if (photographicSensitivity) {
                uploadPhoto.photographicSensitivity = photographicSensitivity;
                uploadPhoto.showPhotographicSensitivity = true;
            }

            const fNumber = tags['FNumber']?.description.toString();
            if (fNumber) {
                uploadPhoto.fNumber = fNumber?.replace('f/', '');
                uploadPhoto.showFNumber = true;
            }

            const createDate = tags['CreateDate']?.description.toString();
            if (createDate) {
                uploadPhoto.createDate = new Date(createDate);
                uploadPhoto.showCreateDate = true;
            }

            const software = tags['CreatorTool']?.description.toString() ?? tags['Software']?.description.toString();
            if (software) {
                uploadPhoto.software = software;
                uploadPhoto.showSoftware = true;
            }

            let gpsLatitude = tags['GPSLatitude']?.description?.toString();
            let gpsLongitude = tags['GPSLongitude']?.description?.toString();

            const gpsLatitudeRef = tags['GPSLatitudeRef']?.value?.toString().toUpperCase();
            const gpsLongitudeRef = tags['GPSLongitudeRef']?.value?.toString().toUpperCase();

            if (gpsLatitude && gpsLongitude) {
                if (gpsLatitudeRef === 'S' && !gpsLatitude.startsWith('-')) {
                    gpsLatitude = '-' + gpsLatitude;
                }

                if (gpsLongitudeRef === 'W' && !gpsLongitude.startsWith('-')) {
                    gpsLongitude = '-' + gpsLongitude;
                }

                uploadPhoto.latitude = gpsLatitude;
                uploadPhoto.longitude = gpsLongitude;
                uploadPhoto.showGpsCoordination = false;
            }
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
