import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Country } from 'src/app/models/country';
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
import { TranslateService } from '@ngx-translate/core';
import { UploadPhotoComponent } from './upload-photo.component';

class PersistenceServiceStub implements PersistenceService {
    private values = new Map<string, unknown>();

    public set(key: string, value: string): void {
        this.values.set(key, value);
    }

    public setJson(key: string, data: unknown): void {
        this.values.set(key, structuredClone(data));
    }

    public get(key: string): string | null {
        return this.values.get(key) as string ?? null;
    }

    public getJson(key: string): unknown {
        const value = this.values.get(key);
        return value === undefined ? null : structuredClone(value);
    }

    public remove(key: string): void {
        this.values.delete(key);
    }
}

describe('UploadPhotoComponent', () => {
    const poland: Country = { id: 'pl-id', code: 'PL', name: 'Poland' };
    const france: Country = { id: 'fr-id', code: 'FR', name: 'France' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UploadPhotoComponent],
            providers: [
                provideNativeDateAdapter(),
                FileSizeService,
                RecentLocationsService,
                { provide: PersistenceService, useClass: PersistenceServiceStub },
                {
                    provide: BreakpointObserver,
                    useValue: {
                        observe: vi.fn(() => of({ matches: false })),
                        isMatched: vi.fn(() => false)
                    }
                },
                { provide: CountriesService, useValue: { all: vi.fn(async () => [poland, france]) } },
                { provide: LocationsService, useValue: { search: vi.fn(async () => []) } },
                { provide: AttachmentsService, useValue: {} },
                { provide: MessagesService, useValue: {} },
                { provide: SettingsService, useValue: { publicSettings: undefined } },
                { provide: InstanceService, useValue: { instance: undefined } },
                { provide: TranslateService, useValue: { instant: vi.fn() } }
            ]
        });
    });

    it('refreshes recent locations when the country changes and the city field stays empty', async () => {
        const fixture = TestBed.createComponent(UploadPhotoComponent);
        fixture.componentRef.setInput('photo', new UploadPhoto('photo-1'));
        fixture.componentRef.setInput('licenses', []);

        const component = fixture.componentInstance;
        const recentLocationsService = TestBed.inject(RecentLocationsService);
        recentLocationsService.add(poland, { id: 'wroclaw-id', name: 'Wrocław' });

        await component.ngOnInit();

        const filteredCountriesSubscription = component['filteredCountries$']?.subscribe();
        const emittedLocationNames: (string | undefined)[][] = [];
        const citiesSubscription = component['cities$']?.subscribe(locations => {
            emittedLocationNames.push(locations.map(location => location.name));
        });

        component['countriesControl'].setValue(poland);
        component['countriesControl'].setValue(france);

        expect(emittedLocationNames).toContainEqual(['Wrocław']);
        expect(emittedLocationNames.at(-1)).toEqual([]);

        filteredCountriesSubscription?.unsubscribe();
        citiesSubscription?.unsubscribe();
        fixture.destroy();
    });

    it('creates an OpenStreetMap URL from the selected city coordinates', async () => {
        const fixture = TestBed.createComponent(UploadPhotoComponent);
        fixture.componentRef.setInput('photo', new UploadPhoto('photo-1'));
        fixture.componentRef.setInput('licenses', []);

        const component = fixture.componentInstance;
        await component.ngOnInit();

        component['selectedCity']({
            id: 'wroclaw-id',
            name: 'Wrocław',
            latitude: '51,1',
            longitude: '17,03333',
            country: poland
        });

        expect(component['mapsUrl']())
            .toBe('https://www.openstreetmap.org/?mlat=51.1&mlon=17.03333#map=10/51.1/17.03333');

        fixture.destroy();
    });
});
