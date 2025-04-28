import { ChangeDetectionStrategy, Component, computed, inject, model, OnInit, signal } from '@angular/core';
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
import { License } from 'src/app/models/license';
import { LicensesService } from 'src/app/services/http/liceses.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { WindowService } from 'src/app/services/common/window.service';
import { StatusTextDialog } from 'src/app/dialogs/status-text-template-dialog/status-text-template.dialog';
import { MatDialog } from '@angular/material/dialog';
import { UserSettingsService } from 'src/app/services/http/user-settings.service';
import { UserSettingKey } from 'src/app/models/user-setting';
import { FileSizeService } from 'src/app/services/common/file-size.service';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.page.html',
    styleUrls: ['./upload.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UploadPage extends ResponsiveComponent implements OnInit {
    protected readonly statusVisibility = StatusVisibility;

    protected photos = signal<UploadPhoto[]>([]);
    protected categories = signal<Category[]>([]);
    protected licenses = signal<License[]> ([]);

    protected statusText = model('');
    protected categoryId = model<string | undefined>(undefined);
    protected visibility = model(StatusVisibility.Public);
    protected commentsDisabled = model(false);
    protected isSensitive = model(false);
    protected contentWarning = model('');
    protected maxFileSizeString = model('');
    protected selectedIndex = model(0);
    protected isCanceling = signal(false);

    protected statusTextTemplate = signal<string | undefined>(undefined);
    protected maxStatusLength = signal(0);
    protected isOpenAIEnabled = signal(false);
    protected hashtagsInProgress = signal(false);

    protected allPhotosUploaded = computed(() => !this.photos().some(x => !x.isUploaded() || (x.photoHdrFile && !x.isHdrUploaded)));

    private maxFileSize = 0;
    private readonly defaultMaxFileSize = 10485760;

    private messageService = inject(MessagesService);
    private attachmentsService = inject(AttachmentsService);
    private categoriesService = inject(CategoriesService);
    private licensesService = inject(LicensesService);
    private statusesService = inject(StatusesService);
    private instanceService = inject(InstanceService);
    private router = inject(Router);
    private settingsService = inject(SettingsService);
    private randomGeneratorService = inject(RandomGeneratorService);
    private windowService = inject(WindowService);
    private dialog = inject(MatDialog);
    private userSettingsService = inject(UserSettingsService);
    private fileSizeService = inject(FileSizeService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.maxFileSize = this.instanceService.instance?.configuration?.attachments?.imageSizeLimit ?? this.defaultMaxFileSize;
        this.maxFileSizeString.set(this.fileSizeService.getHumanFileSize(this.maxFileSize, 0));

        this.maxStatusLength.set(this.instanceService.instance?.configuration?.statuses?.maxCharacters ?? 500);
        this.isOpenAIEnabled.set(this.settingsService.publicSettings?.isOpenAIEnabled ?? false);

        const [internalCategories, internalLicenses, internalStatusTextTemplate] = await Promise.all([
            this.categoriesService.all(),
            this.licensesService.all(),
            this.userSettingsService.read(UserSettingKey.statusTextTemplate)
        ]);

        this.categories.set(internalCategories);
        this.licenses.set(internalLicenses);
        this.statusTextTemplate.set(internalStatusTextTemplate?.value);
    }

    protected async onPhotoSelected(event: any): Promise<void> {
        const file = event.target.files[0];
        if (file.size > this.maxFileSize) {
            this.messageService.showError(`Uploaded file is too large. Maximum size is ${this.maxFileSizeString()}.`);
            return;
        }

        const photoUuid = this.randomGeneratorService.generateString(16);
        const uploadPhoto = new UploadPhoto(photoUuid, event.target.files[0]);

        this.setPhotoData(uploadPhoto);
        this.setExifMetadata(uploadPhoto, async () => {
            try {
                this.photos.update(photos => [...photos, uploadPhoto]);

                const formData = new FormData();
                formData.append('file', uploadPhoto.photoFile);
                const temporaryAttachment = await this.attachmentsService.uploadAttachment(formData);

                this.photos.update(photosArray => {
                    const photo = photosArray.find(item => item.uuid === uploadPhoto.uuid);
                    if (photo) {
                        photo.id = temporaryAttachment.id;
                        photo.isUploaded.set(true);
                    }

                    return [...photosArray];
                });
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        });
    }

    protected onImageClick(index: number): void {
        this.selectedIndex.set(index);
    }

    protected async onCancel(): Promise<void> {
        try {
            this.isCanceling.set(true);

            for (const photo of this.photos()) {
                if (photo.isUploaded()) {
                    await this.attachmentsService.deleteAttachment(photo.id);
                }
            }

            this.isCanceling.set(false);
            await this.router.navigate(['/']);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.hashtagsInProgress.set(false);
        }
    }

    protected async onPhotoDelete(photo: UploadPhoto): Promise<void> {
        try {
            photo.isDeleting.set(true);
            await this.attachmentsService.deleteAttachment(photo.id);
            photo.isDeleting.set(false);

            this.photos.update(photos => photos.filter(x => x !== photo));
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.hashtagsInProgress.set(false);
        }
    }

    protected onInsertTemplate(): void {
        this.statusText.update((value) => value + this.statusTextTemplate());
    }

    protected onEditTemplate(): void {
        const dialogRef = this.dialog.open(StatusTextDialog, {
            width: '500px',
            data: this.statusTextTemplate()
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.statusTextTemplate.set(result?.value);
            }
        });
    }

    protected async onGenerateHashtags(): Promise<void> {
        try {
            const internalPhotos = this.photos();
            if (internalPhotos.length === 0) {
                return;
            }

            if (!internalPhotos[0].id) {
                return;
            }

            this.hashtagsInProgress.set(true);
            const attachmentHashtags = await this.attachmentsService.hashtags(internalPhotos[0].id);
            if (attachmentHashtags.hashtags && attachmentHashtags.hashtags.length > 0) {
                const hashtags = attachmentHashtags.hashtags.map(tag => '#' + tag);
                this.statusText.update((value) => value + '\n\n' + hashtags.join(' '));
                this.setCategoryBasedOnHashtags();
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.hashtagsInProgress.set(false);
        }
    }

    protected async onSubmit(): Promise<void> {
        try {
            const internalPhotos = this.photos();

            for (const photo of internalPhotos) {
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

                if (photo.showCreateDate && photo.createDate) {
                    temporaryAttachment.createDate = this.getDateTime(photo.createDate);
                }

                if (photo.showFocalLenIn35mmFilm) {
                    temporaryAttachment.focalLenIn35mmFilm = photo.focalLenIn35mmFilm;
                    temporaryAttachment.focalLength = photo.focalLength;
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

                if (photo.showFlash) {
                    temporaryAttachment.flash = photo.flash
                }

                temporaryAttachment.locationId = photo.locationId;
                temporaryAttachment.licenseId = photo.licenseId;

                await this.attachmentsService.updateAttachment(temporaryAttachment);
            }

            const status = new StatusRequest();
            status.note = this.statusText();
            status.categoryId = this.categoryId();
            status.visibility = this.visibility();
            status.commentsDisabled = this.commentsDisabled();
            status.sensitive = this.isSensitive();
            status.contentWarning = this.contentWarning() === '' ? undefined : this.contentWarning();

            for (const photo of internalPhotos) {
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

    protected onStatusTextChange(): void {
        this.setCategoryBasedOnHashtags();
    }

    protected drop(event: CdkDragDrop<string[]>) {
        // We have to move item in the list.
        const internalPhotos = this.photos();
        moveItemInArray(internalPhotos, event.previousIndex, event.currentIndex);
        this.photos.update(() => [...internalPhotos]);

        // When moved items we have to select first one.
        this.selectedIndex.set(0);
        this.windowService.scrollToTop();
    }

    private getDateTime(date: any): string | undefined {
        if (typeof date.toISOString === 'function') {
            return date.toISOString();
        }

        const dateObject = new Date(date);
        if (dateObject.toString() !== 'Invalid Date') {
            return dateObject.toISOString();
        }

        return undefined;
    }

    private setCategoryBasedOnHashtags(): void {
        if (this.categoryId()) {
            return;
        }

        const statusTextNormalized = this.statusText().toUpperCase();
        for (const category of this.categories()) {
            if (category.hashtags) {
                for (const hashtag of category.hashtags.filter(x => x.hashtagNormalized !== '')) {
                    if (statusTextNormalized.includes('#' + hashtag.hashtagNormalized)) {
                        this.categoryId.set(category.id);
                        return;
                    }
                }
            }
        }
    }

    private setPhotoData(uploadPhoto: UploadPhoto): void {
        const reader = new FileReader();

        reader.onload = async () => {
            const photoSrc = reader.result as string;
            uploadPhoto.photoSrc.set(photoSrc);

            const blurhash = await this.encodeImageToBlurhash(photoSrc);
            uploadPhoto.blurhash = blurhash;
        }

        reader.readAsDataURL(uploadPhoto.photoFile);
    }

    private setExifMetadata(uploadPhoto: UploadPhoto, listener: () => void): void {
        const bufferReader = new FileReader();

        bufferReader.addEventListener('load', () => {
            const tags = ExifReader.load(bufferReader.result as ArrayBuffer);

            const caption = tags['Caption/Abstract']?.description.toString();
            if (caption) {
                uploadPhoto.description = caption.trim();
            }

            const make = tags['Make']?.description.toString();
            if (make) {
                uploadPhoto.make = make;
                uploadPhoto.showMake = true;
            }

            const model = tags['Model']?.description.toString();
            if (model) {
              if (make) {
                const strippedModel = this.stripModel(model, make);
                uploadPhoto.model = strippedModel;
              } else {
                uploadPhoto.model = model;
              }
                uploadPhoto.showModel = true;
            }

            const lens = tags['Lens']?.description.toString();
            if (lens) {
                uploadPhoto.lens = lens;
                uploadPhoto.showLens = true;
            }

            const focalLength = tags['FocalLength']?.description.toString();
            if (focalLength) {
                uploadPhoto.focalLength = focalLength.replace('mm', '').trim();
                uploadPhoto.showFocalLenIn35mmFilm = true;
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

            const flash = tags['Flash']?.description.toString();
            if (flash) {
                uploadPhoto.flash = flash;
                uploadPhoto.showFlash = true;
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

            listener();
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

    private stripModel(model: string, manufacturer: string): string {

      if (manufacturer && model.startsWith(manufacturer)) {
          model = model.replace(manufacturer, '').trim();
      }
      return model;
    }

}
