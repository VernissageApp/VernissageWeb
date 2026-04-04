import { signal } from "@angular/core";
import { Subscription } from "rxjs";
import { Location } from 'src/app/models/location';

export class UploadPhoto {
    public uuid = '';

    public photoSrc = signal<string | undefined>(undefined);
    public isUploaded = signal(false);
    public isDeleting = signal(false);
    public isUploading = signal(false);
    public uploadProgress = signal(0);

    public blurhash?: string;
    public photoFile?: Blob;
    public photoResizedFile?: Blob;
    public photoHdrFile?: Blob;
    public photoHdrSrc?: string;
    public isHdrUploaded = false;

    public id = '';
    public isAlreadyConnected = false;
    public description?: string;
    public uploadSubscription?: Subscription;

    public locationId?: string;
    public licenseId?: string;

    // Location is used in edit mode.
    public location?: Location;

    public showMake = false;
    public showModel = false;
    public showLens = false;
    public showCreateDate = false;
    public showFocalLenIn35mmFilm = false;
    public showFNumber = false;
    public showExposureTime = false;
    public showPhotographicSensitivity = false;
    public showSoftware = false;
    public showFilm = false;
    public showChemistry = false;
    public showScanner = false;
    public showGpsCoordination = false;
    public showFlash = false;

    public make?: string;
    public model?: string;
    public lens?: string;
    public createDate?: Date;
    public focalLength?: string;
    public focalLenIn35mmFilm?: string;
    public fNumber?: string;
    public exposureTime?: string;
    public flash?: string;
    public photographicSensitivity?: string;
    public software?: string;
    public film?: string;
    public chemistry?: string;
    public scanner?: string;
    public latitude?: string;
    public longitude?: string;

    constructor(uuid: string) {
        this.uuid = uuid;
    }
}
