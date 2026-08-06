import { BreakpointObserver } from '@angular/cdk/layout';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Country } from 'src/app/models/country';
import { UploadPhoto } from 'src/app/models/upload-photo';
import { FileSizeService } from 'src/app/services/common/file-size.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { RecentLocationsService } from 'src/app/services/common/recent-locations.service';
import { AttachmentsService } from 'src/app/services/http/attachments.service';
import { CamerasService } from 'src/app/services/http/cameras.service';
import { CountriesService } from 'src/app/services/http/countries.service';
import { FilmsService } from 'src/app/services/http/films.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { LensesService } from 'src/app/services/http/lenses.service';
import { LocationsService } from 'src/app/services/http/locations.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { PersistenceService } from 'src/app/services/persistance/persistance.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedNativeDateAdapter } from 'src/app/common/localized-native-date-adapter';
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
                { provide: DateAdapter, useClass: LocalizedNativeDateAdapter },
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
                { provide: CamerasService, useValue: { get: vi.fn(async () => ({ data: [] })) } },
                { provide: LensesService, useValue: { get: vi.fn(async () => ({ data: [] })) } },
                { provide: FilmsService, useValue: { get: vi.fn(async () => ({ data: [] })) } },
                { provide: AttachmentsService, useValue: {} },
                { provide: MessagesService, useValue: {} },
                { provide: SettingsService, useValue: { publicSettings: undefined } },
                { provide: InstanceService, useValue: { instance: undefined } },
                {
                    provide: TranslateService,
                    useValue: {
                        instant: vi.fn(),
                        translate: vi.fn((key: string) => () => key)
                    }
                }
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

    it('creates an OpenStreetMap URL from manually entered GPS coordinates', async () => {
        const photo = new UploadPhoto('photo-1');
        const fixture = TestBed.createComponent(UploadPhotoComponent);
        fixture.componentRef.setInput('photo', photo);
        fixture.componentRef.setInput('licenses', []);

        const component = fixture.componentInstance;
        await component.ngOnInit();

        expect(component['gpsMapsUrl']()).toBeUndefined();

        photo.latitude = '51,1';
        photo.longitude = '17,03333';

        expect(component['gpsMapsUrl']())
            .toBe('https://www.openstreetmap.org/?mlat=51.1&mlon=17.03333#map=10/51.1/17.03333');

        fixture.destroy();
    });

    it('updates the photo date from a manually entered localized date', async () => {
        const photo = new UploadPhoto('photo-1');
        photo.createDate = new Date(2025, 0, 1);
        const dateAdapter = TestBed.inject(DateAdapter<Date>);
        dateAdapter.setLocale('pl-PL');

        const fixture = TestBed.createComponent(UploadPhotoComponent);
        fixture.componentRef.setInput('photo', photo);
        fixture.componentRef.setInput('licenses', []);
        await fixture.componentInstance.ngOnInit();
        fixture.detectChanges();

        const dateInput = fixture.debugElement.query(By.directive(MatDatepickerInput)).nativeElement as HTMLInputElement;
        dateInput.value = '1.08.2026';
        dateInput.dispatchEvent(new Event('input'));

        expect(photo.createDate?.getFullYear()).toBe(2026);
        expect(photo.createDate?.getMonth()).toBe(7);
        expect(photo.createDate?.getDate()).toBe(1);

        fixture.destroy();
    });

    it('searches camera suggestions after two characters and a debounce', async () => {
        vi.useFakeTimers();

        try {
            const camerasService = TestBed.inject(CamerasService);
            const getSpy = vi.spyOn(camerasService, 'get').mockResolvedValue({
                page: 1,
                size: 10,
                total: 1,
                data: [{ id: 'camera-1', name: 'Canon AE-1', make: 'Canon', model: 'AE-1', amount: 1 }]
            });
            const fixture = TestBed.createComponent(UploadPhotoComponent);
            fixture.componentRef.setInput('photo', new UploadPhoto('photo-1'));
            fixture.componentRef.setInput('licenses', []);

            const component = fixture.componentInstance;
            await component.ngOnInit();

            const suggestions: string[][] = [];
            const subscription = component['cameraMakes$']?.subscribe(cameras => {
                suggestions.push(cameras.map(camera => camera.name));
            });

            component['onCameraMakeChange']('C');
            await vi.advanceTimersByTimeAsync(400);
            expect(getSpy).not.toHaveBeenCalled();

            component['onCameraMakeChange']('Ca');
            await vi.advanceTimersByTimeAsync(200);

            component['onCameraMakeChange']('Can');
            await vi.advanceTimersByTimeAsync(399);
            expect(getSpy).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(1);
            expect(getSpy).toHaveBeenCalledWith('Can', 1, 10);
            expect(suggestions.at(-1)).toEqual(['Canon AE-1']);

            subscription?.unsubscribe();
            fixture.destroy();
        } finally {
            vi.useRealTimers();
        }
    });
});
