export class UploadPhoto {
    public photoFile: Blob;
    public photoSrc?: string;
    public isUploaded = false;

    public id = '';
    public description?: string;
    public blurhash?: string;
    public locationId?: string;
    public licenseId?: string;

    public showMake = false;
    public showModel = false;
    public showLens = false;
    public showCreateDate = false;
    public showFocalLenIn35mmFilm = false;
    public showFNumber = false;
    public showExposureTime = false;
    public showPhotographicSensitivity = false;
    public showFilm = false;

    public make?: string;
    public model?: string;
    public lens?: string;
    public createDate?: Date;
    public focalLenIn35mmFilm?: string;
    public fNumber?: string;
    public exposureTime?: string;
    public photographicSensitivity?: string;
    public film?: string;

    constructor(photoFile: Blob) {
        this.photoFile = photoFile;
    }
}
