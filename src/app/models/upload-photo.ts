export class UploadPhoto {
    public uuid = '';
    public photoFile: Blob;
    public photoSrc?: string;
    public isUploaded = false;

    public photoHdrFile?: Blob;
    public photoHdrSrc?: string;
    public isHdrUploaded = false;

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
    public showSoftware = false;
    public showFilm = false;
    public showChemistry = false;
    public showScanner = false;
    public showGpsCoordination = false;

    public make?: string;
    public model?: string;
    public lens?: string;
    public createDate?: Date;
    public focalLenIn35mmFilm?: string;
    public fNumber?: string;
    public exposureTime?: string;
    public photographicSensitivity?: string;
    public software?: string;
    public film?: string;
    public chemistry?: string;
    public scanner?: string;
    public latitude?: string;
    public longitude?: string;

    constructor(uuid: string, photoFile: Blob) {
        this.uuid = uuid;
        this.photoFile = photoFile;
    }
}
