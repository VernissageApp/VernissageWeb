export class UploadPhoto {
    public photoFile: Blob;
    public photoSrc?: string;
    public isUploaded = false;

    public id = '';
    public description?: string;
    public blurhash?: string;
    public locationId?: string;
    public licenseId?: string;

    public showMake = true;
    public showModel = true;
    public showLens = true;
    public showCreateDate = true;
    public showFocalLenIn35mmFilm = true;
    public showFNumber = true;
    public showExposureTime = true;
    public showPhotographicSensitivity = true;

    public make?: string;
    public model?: string;
    public lens?: string;
    public createDate?: string;
    public focalLenIn35mmFilm?: string;
    public fNumber?: string;
    public exposureTime?: string;
    public photographicSensitivity?: string;

    constructor(photoFile: Blob) {
        this.photoFile = photoFile;
    }
}
