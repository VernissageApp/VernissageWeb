import { ChangeDetectionStrategy, Component, inject, input, model, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map, switchMap } from 'rxjs/operators';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Country } from 'src/app/models/country';
import { License } from 'src/app/models/license';
import { Location } from 'src/app/models/location';
import { UploadPhoto } from 'src/app/models/upload-photo';
import { FileSizeService } from 'src/app/services/common/file-size.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AttachmentsService } from 'src/app/services/http/attachments.service';
import { CountriesService } from 'src/app/services/http/countries.service';
import { LocationsService } from 'src/app/services/http/locations.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { PersistenceService } from 'src/app/services/persistance/persistance.service';

@Component({
    selector: 'app-upload-photo',
    templateUrl: './upload-photo.component.html',
    styleUrls: ['./upload-photo.component.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UploadPhotoComponent extends ResponsiveComponent implements OnInit {
    public photo = model.required<UploadPhoto>();
    public licenses = input.required<License[]>();

    protected cities$?: Observable<Location[]>;
    protected citiesControl = new FormControl<string | Location>('');
    protected filteredCountries$?: Observable<Country[]>;
    protected countriesControl = new FormControl<string | Country>('');    
    protected isOpenAIEnabled = signal(false);
    protected describeInProgress = signal(false);
    protected currentCountry = signal<Country | undefined>(undefined);
    protected currentCity = signal<Location | undefined>(undefined);
    protected hdrFileSizeString = signal<string>('');

    private readonly defaultMaxHdrFileSize = 4194304;
    private readonly defaultCountryCacheKey = 'default-country';
    private readonly defaultLocationCacheKey = 'default-location';
    private readonly defaultLicenseCacheKey = 'default-license';

    private allCountries: Country[] = [];
    private initialized = false;

    private countriesService = inject(CountriesService);
    private locationService = inject(LocationsService);
    private attachmentsService = inject(AttachmentsService);
    private messageService = inject(MessagesService);
    private settingsService = inject(SettingsService);
    private persistenceService = inject(PersistenceService);
    private fileSizeService = inject(FileSizeService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.isOpenAIEnabled.set(this.settingsService.publicSettings?.isOpenAIEnabled ?? false);
        this.allCountries = await this.countriesService.all();
        this.hdrFileSizeString.set(this.fileSizeService.getHumanFileSize(this.defaultMaxHdrFileSize, 0));

        this.filteredCountries$ = this.countriesControl.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;

                // During first initialization (restoring country from cache we have to restore also city).
                if (this.initialized) {
                    this.citiesControl.setValue('');
                    this.currentCity.set(undefined);
                } else {
                    this.restoreCityFromCache();
                    this.initialized = true;
                }

                return name ? this.filterCountry(name as string) : this.allCountries.slice();
            }),
        );

        this.cities$ = this.citiesControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(1000),
            switchMap(value => {
                const query = typeof value === 'string' ? value : value?.name;
                return this.locationService.search(this.currentCountry()?.code ?? "GB", query)
            })
        );

        this.restoreCountryFromCache();
        this.restoreCityFromCache();
        this.restoreLicenseFromCache();
    }

    protected displayCountryFn(country: Country): string {
        return country && country.name ? country.name : '';
    }

    protected displayCityFn(location: Location): string {
        return location && location.name ? location.name : '';
    }

    protected selectedCountry(country?: Country): void {
        this.currentCountry.set(country);
        this.storeCountryInCache(country);
    }

    protected onCountryClear(): void {
        this.countriesControl.setValue('');
        this.currentCountry.set(undefined);
        this.storeCountryInCache(undefined);

        this.onCityClear();
    }

    protected selectedCity(location?: Location): void {
        this.currentCity.set(location);
        this.storeCityInCache(location);

        this.photo.update((photo) => {
            photo.locationId = this.currentCity()?.id;
            return photo;
        });
    }

    protected onCityClear(): void {
        this.citiesControl.setValue('');
        this.currentCity.set(undefined);
        this.storeCityInCache(undefined);

        this.photo.update((photo) => {
            photo.locationId = this.currentCity()?.id;
            return photo;
        });
    }

    protected onLicenseChange(): void {
        this.storeLicenseInCache(this.photo().licenseId);
    }

    protected async onGenerateDescription(): Promise<void> {
        try {
            this.describeInProgress.set(true);
            const attachmentDescription = await this.attachmentsService.describe(this.photo().id);
            if (attachmentDescription.description) {
                this.photo.update((photo) => {
                    photo.description = attachmentDescription.description;
                    return photo;
                });
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.describeInProgress.set(false);
        }
    }

    protected async onHdrPhotoSelected(event: any): Promise<void> {
        try {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            if (file.size > this.defaultMaxHdrFileSize) {
                this.messageService.showError(`Uploaded file is too large. Maximum size is ${this.hdrFileSizeString()}.`);
                return;
            }

            this.photo.update((photo) => {
                photo.photoHdrFile = file;
                return photo;
            });

            if (!file) {
                return;
            }

            this.setPhotoData();
            const formData = new FormData();
            formData.append('file', file);
            const temporaryAttachment = await this.attachmentsService.uploadHdrImage(this.photo().id, formData);

            this.photo.update((photo) => {
                photo.id = temporaryAttachment.id;
                photo.isHdrUploaded = true;

                return photo;
            });

            event.target.value = '';
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onHdrDelete(): Promise<void> {
        try {
            await this.attachmentsService.deleteHdrImage(this.photo().id);

            this.photo.update((photo) => {
                photo.isHdrUploaded = false;
                photo.photoHdrFile = undefined;
                photo.photoHdrSrc = undefined;

                return photo;
            });

        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private filterCountry(value: string): Country[] {
        const filterValue = value.toLowerCase();
        return this.allCountries.filter(option => option.name?.toLowerCase().includes(filterValue));
    }

    private setPhotoData(): void {
        const photoHdrFile = this.photo().photoHdrFile
        if (!photoHdrFile) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            this.photo.update((photo) => {
                photo.photoHdrSrc = reader.result as string;
                return photo;
            });
            
        }

        reader.readAsDataURL(photoHdrFile);
    }

    private storeCountryInCache(country?: Country): void {
        if (country) {
            this.persistenceService.setJson(this.defaultCountryCacheKey, country);
        } else {
            this.persistenceService.remove(this.defaultCountryCacheKey);
        }
    }

    private storeCityInCache(location?: Location): void {
        if (location) {
            this.persistenceService.setJson(this.defaultLocationCacheKey, location);
        } else {
            this.persistenceService.remove(this.defaultLocationCacheKey);
        }
    }

    private storeLicenseInCache(licenseId?: string): void {
        if (licenseId) {
            this.persistenceService.set(this.defaultLicenseCacheKey, licenseId);
        } else {
            this.persistenceService.remove(this.defaultLicenseCacheKey);
        }
    }

    private restoreCountryFromCache(): void {
        const persistedCountry = this.persistenceService.getJson(this.defaultCountryCacheKey) as Country;
        if (persistedCountry) {
            const foundedCountry = this.allCountries.find(x => x.id === persistedCountry.id);
            if (foundedCountry) {
                this.currentCountry.set(foundedCountry);
                this.countriesControl.setValue(foundedCountry);
            }
        }
    }

    private restoreCityFromCache(): void {
        const persistedLocation = this.persistenceService.getJson(this.defaultLocationCacheKey) as Location;
        if (persistedLocation) {
            this.currentCity.set(persistedLocation);
            this.citiesControl.setValue(persistedLocation);

            this.photo.update((photo) => {
                photo.locationId = this.currentCity()?.id;
                return photo;
            });
        }
    }

    private restoreLicenseFromCache(): void {
        const persistedLicense = this.persistenceService.get(this.defaultLicenseCacheKey);
        if (persistedLicense) {

            this.photo.update((photo) => {
                photo.licenseId = persistedLicense;
                return photo;
            });
        }
    }
}
