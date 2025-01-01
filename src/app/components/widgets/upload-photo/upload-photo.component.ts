import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
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
import { MessagesService } from 'src/app/services/common/messages.service';
import { AttachmentsService } from 'src/app/services/http/attachments.service';
import { CountriesService } from 'src/app/services/http/countries.service';
import { LocationsService } from 'src/app/services/http/locations.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-upload-photo',
    templateUrl: './upload-photo.component.html',
    styleUrls: ['./upload-photo.component.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class UploadPhotoComponent extends ResponsiveComponent implements OnInit {
    readonly defaultMaxHdrFileSize = 4194304;

    @Input() photo!: UploadPhoto;
    @Input() licenses!: License[];
    @Input() index = 0;

    cities$?: Observable<Location[]>;
    citiesControl = new FormControl<string | Location>('');
    currentCity?: Location;
    isOpenAIEnabled = false;

    countriesControl = new FormControl<string | Country>('');
    allCountries: Country[] = [];
    filteredCountries?: Observable<Country[]>;
    currentCountry?: Country;
    describeInProgress = false;

    constructor(
        private countriesService: CountriesService,
        private locationService: LocationsService,
        private attachmentsService: AttachmentsService,
        private messageService: MessagesService,
        private settingsService: SettingsService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.allCountries = await this.countriesService.all();

        this.filteredCountries = this.countriesControl.valueChanges.pipe(
            startWith(''),
            map(value => {
                const name = typeof value === 'string' ? value : value?.name;

                this.citiesControl.setValue('');
                this.currentCity = undefined;

                return name ? this.filterCountry(name as string) : this.allCountries.slice();
            }),
        );

        this.cities$ = this.citiesControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(1000),
            switchMap(value => {
                const query = typeof value === 'string' ? value : value?.name;
                return this.locationService.search(this.currentCountry?.code ?? "GB", query)
            })
        );

        this.isOpenAIEnabled = this.settingsService.publicSettings?.isOpenAIEnabled ?? false;
    }

    displayCountryFn(country: Country): string {
        return country && country.name ? country.name : '';
    }

    displayCityFn(location: Location): string {
        return location && location.name ? location.name : '';
    }

    selectedCountry(country?: Country): void {
        this.currentCountry = country;
    }

    selectedCity(location?: Location): void {
        this.currentCity = location;
        this.photo.locationId = this.currentCity?.id;
    }

    async onGenerateDescription(): Promise<void> {
        try {
            this.describeInProgress = true;
            const attachmentDescription = await this.attachmentsService.describe(this.photo.id);
            if (attachmentDescription.description) {
                this.photo.description = attachmentDescription.description;
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.describeInProgress = false;
        }
    }

    async onHdrPhotoSelected(event: any): Promise<void> {
        try {
            const file = event.target.files[0];
            if (file.size > this.defaultMaxHdrFileSize) {
                this.messageService.showError('Uploaded file is too large. Maximum size is 4MB.');
                return;
            }

            this.photo.photoHdrFile = file;
            if (!this.photo.photoHdrFile) {
                return;
            }

            this.setPhotoData();
            const formData = new FormData();
            formData.append('file', this.photo.photoHdrFile);
            const temporaryAttachment = await this.attachmentsService.uploadHdrImage(this.photo.id, formData);

            this.photo.id = temporaryAttachment.id;
            this.photo.isHdrUploaded = true;

            event.target.value = '';
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onHdrDelete(): Promise<void> {
        try {
            await this.attachmentsService.deleteHdrImage(this.photo.id);
            this.photo.isHdrUploaded = false;
            this.photo.photoHdrFile = undefined;
            this.photo.photoHdrSrc = undefined;
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
        if (!this.photo.photoHdrFile) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            this.photo.photoHdrSrc = reader.result as string;
        }

        reader.readAsDataURL(this.photo.photoHdrFile);
    }
}