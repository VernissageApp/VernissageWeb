import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map, switchMap } from 'rxjs/operators';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Country } from 'src/app/models/country';
import { License } from 'src/app/models/license';
import { Location } from 'src/app/models/location';
import { UploadPhoto } from 'src/app/models/upload-photo';
import { CountriesService } from 'src/app/services/http/countries.service';
import { LocationsService } from 'src/app/services/http/locations.service';

@Component({
    selector: 'app-upload-photo',
    templateUrl: './upload-photo.component.html',
    styleUrls: ['./upload-photo.component.scss'],
    animations: fadeInAnimation
})
export class UploadPhotoComponent implements OnInit {
    @Input() photo!: UploadPhoto;
    @Input() licenses!: License[];
    @Input() index = 0;

    cities$?: Observable<Location[]>;
    citiesControl = new FormControl<string | Location>('');
    currentCity?: Location;

    countriesControl = new FormControl<string | Country>('');
    allCountries: Country[] = [];
    filteredCountries?: Observable<Country[]>;
    currentCountry?: Country;

    constructor(private countriesService: CountriesService,
                private locationService: LocationsService) {
    }

    async ngOnInit(): Promise<void> {
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

    private filterCountry(value: string): Country[] {
        const filterValue = value.toLowerCase();
        return this.allCountries.filter(option => option.name?.toLowerCase().includes(filterValue));
    }
}