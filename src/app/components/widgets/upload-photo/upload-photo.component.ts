import { ChangeDetectionStrategy, Component, computed, inject, input, model, OnInit, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounce, defer, distinctUntilChanged, map, Observable, of, startWith, switchMap, timer } from 'rxjs';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Country } from 'src/app/models/country';
import { License } from 'src/app/models/license';
import { Location } from 'src/app/models/location';
import { UploadPhoto } from 'src/app/models/upload-photo';
import { FileSizeService } from 'src/app/services/common/file-size.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { RecentLocationsService } from 'src/app/services/common/recent-locations.service';
import { AttachmentsService } from 'src/app/services/http/attachments.service';
import { CountriesService } from 'src/app/services/http/countries.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { LocationsService } from 'src/app/services/http/locations.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { PersistenceService } from 'src/app/services/persistance/persistance.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError, MatHint, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { InputActivityDirective } from '../../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MaxLengthValidatorDirective } from '../../../validators/directives/max-length-validator.directive';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { AutocompleteValidDirective } from '../../../validators/directives/autocomplete-valid.directive';
import { MatDivider } from '@angular/material/list';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDatepickerInput, MatDatepicker, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatTimepickerInput, MatTimepicker, MatTimepickerToggle } from '@angular/material/timepicker';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-upload-photo',
    templateUrl: './upload-photo.component.html',
    styleUrls: ['./upload-photo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatProgressSpinner, MatButton, MatIcon, MatFormField, MatLabel, InputActivityDirective, MatInput, CdkTextareaAutosize, FormsModule, MaxLengthValidatorDirective, MatError, MatHint, MatSelect, MatOption, MatAutocompleteTrigger, ReactiveFormsModule, AutocompleteValidDirective, MatAutocomplete, MatIconButton, MatSuffix, MatDivider, MatCheckbox, MatPrefix, MatDatepickerInput, MatDatepicker, MatDatepickerToggle, MatTimepickerInput, MatTimepicker, MatTimepickerToggle, AsyncPipe, TranslatePipe]
})
export class UploadPhotoComponent extends ResponsiveComponent implements OnInit {
    public photo = model.required<UploadPhoto>();
    public licenses = input.required<License[]>();
    public cancelUpload = output<UploadPhoto>();

    protected cities$?: Observable<Location[]>;
    protected citiesControl = new FormControl<string | Location>('');
    protected filteredCountries$?: Observable<Country[]>;
    protected countriesControl = new FormControl<string | Country>('');    
    protected isOpenAIEnabled = signal(false);
    protected describeInProgress = signal(false);
    protected currentCountry = signal<Country | undefined>(undefined);
    protected currentCity = signal<Location | undefined>(undefined);
    protected mapsUrl = computed(() => this.createMapsUrl(
        this.currentCity()?.latitude,
        this.currentCity()?.longitude
    ));
    protected hdrFileSizeString = signal('');
    protected maxFileSizeString = signal('');
    protected openAIProviderName = signal('');

    private readonly defaultMaxHdrFileSize = 4194304;
    private readonly defaultMaxFileSize = 10485760;
    private readonly maxDescriptionLength = 2000;
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
    private instanceService = inject(InstanceService);
    private translateService = inject(TranslateService);
    private recentLocationsService = inject(RecentLocationsService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.isOpenAIEnabled.set(this.settingsService.publicSettings?.isOpenAIEnabled ?? false);
        this.allCountries = await this.countriesService.all();
        this.hdrFileSizeString.set(this.fileSizeService.getHumanFileSize(this.defaultMaxHdrFileSize, 0));

        const internalOpenAIProviderName = this.settingsService.publicSettings?.openAIProviderName?.trim() || 'OpenAI';
        this.openAIProviderName.set(internalOpenAIProviderName);

        const maxFileSize = this.instanceService.instance?.configuration?.attachments?.imageSizeLimit ?? this.defaultMaxFileSize;
        this.maxFileSizeString.set(this.fileSizeService.getHumanFileSize(maxFileSize, 0));

        this.filteredCountries$ = this.countriesControl.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;

                // During first initialization (restoring country from cache we have to restore also city).
                if (this.initialized) {
                    if (typeof value === 'string') {
                        this.currentCountry.set(undefined);
                        this.storeCountryInCache(undefined);
                    } else {
                        this.currentCountry.set(value ?? undefined);
                    }

                    this.citiesControl.setValue('');
                    this.clearSelectedCity();
                } else {
                    if (!this.photo().id) {
                        this.restoreCityFromCache();
                    }

                    this.initialized = true;
                }

                return name ? this.filterCountry(name as string) : this.allCountries.slice();
            }),
        );

        this.cities$ = defer(() => this.citiesControl.valueChanges.pipe(
            startWith(this.citiesControl.value)
        )).pipe(
            map(value => ({ value, country: this.currentCountry() })),
            distinctUntilChanged((previous, current) =>
                previous.value === current.value
                && previous.country?.id === current.country?.id
                && previous.country?.code === current.country?.code),
            debounce(({ value }) => typeof value === 'string' && value.trim()
                ? timer(1000)
                : of(0)),
            switchMap(({ value, country }) => {
                const query = typeof value === 'string' ? value.trim() : '';

                if (typeof value === 'string') {
                    this.clearSelectedCity();
                }

                if (!query) {
                    return of(this.recentLocationsService.get(country));
                }

                return this.locationService.search(country?.code ?? 'GB', query);
            })
        );

        if (!this.photo().id) {
            this.restoreCountryFromCache();
            this.restoreCityFromCache();
            this.restoreLicenseFromCache();
        }

        const location = this.photo().location;
        if (location) {
            const country = this.photo().location?.country;
            if (country) {
                this.currentCountry.set(country);
                this.countriesControl.setValue(country);
            }

            this.currentCity.set(location);
            this.citiesControl.setValue(location);
        }
    }

    public isValid(): boolean {
        const descriptionLength = this.photo().description?.length ?? 0;
        return this.countriesControl.valid && this.citiesControl.valid && descriptionLength <= this.maxDescriptionLength;
    }

    protected displayCountryFn(country: Country | string): string {
        if (typeof country === 'string') {
            return country;
        }

        return country && country.name ? country.name : '';
    }

    protected displayCityFn(location: Location | string): string {
        if (typeof location === 'string') {
            return location;
        }

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
        this.recentLocationsService.add(this.currentCountry(), location);

        this.photo.update((photo) => {
            photo.locationId = this.currentCity()?.id;
            return photo;
        });
    }

    protected onCityClear(autocompleteTrigger?: MatAutocompleteTrigger): void {
        this.citiesControl.setValue('');
        this.currentCity.set(undefined);
        this.storeCityInCache(undefined);

        this.photo.update((photo) => {
            photo.locationId = this.currentCity()?.id;
            return photo;
        });

        if (autocompleteTrigger) {
            setTimeout(() => autocompleteTrigger.openPanel());
        }
    }

    protected onLicenseChange(): void {
        this.storeLicenseInCache(this.photo().licenseId);
    }

    protected gpsMapsUrl(): string | undefined {
        return this.createMapsUrl(this.photo().latitude, this.photo().longitude);
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

    protected onCancelUpload(): void {
        this.cancelUpload.emit(this.photo());
    }

    protected async onHdrPhotoSelected(event: any): Promise<void> {
        try {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            if (file.size > this.defaultMaxHdrFileSize) {
                this.messageService.showError(this.translateService.instant('components.uploadPhoto.messages.uploadedFileTooLarge', { size: this.hdrFileSizeString() }));
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

    private createMapsUrl(latitudeValue?: string, longitudeValue?: string): string | undefined {
        const latitude = latitudeValue?.trim().replace(',', '.');
        const longitude = longitudeValue?.trim().replace(',', '.');
        if (!latitude || !longitude) {
            return undefined;
        }

        return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
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

    private clearSelectedCity(): void {
        this.currentCity.set(undefined);
        this.storeCityInCache(undefined);

        this.photo.update((photo) => {
            photo.locationId = undefined;
            return photo;
        });
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
            this.recentLocationsService.add(this.currentCountry(), persistedLocation);

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
