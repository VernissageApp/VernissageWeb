import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Country } from 'src/app/models/country';
import { PersistenceService } from '../persistance/persistance.service';
import { RecentLocationsService } from './recent-locations.service';

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

describe('RecentLocationsService', () => {
    let service: RecentLocationsService;

    const poland: Country = { id: 'pl-id', code: 'PL', name: 'Poland' };
    const germany: Country = { id: 'de-id', code: 'DE', name: 'Germany' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RecentLocationsService,
                { provide: PersistenceService, useClass: PersistenceServiceStub }
            ]
        });

        service = TestBed.inject(RecentLocationsService);
    });

    it('stores at most five most recently selected locations for a country', () => {
        for (let index = 1; index <= 6; index++) {
            service.add(poland, { id: `${index}`, name: `City ${index}` });
        }

        expect(service.get(poland).map(location => location.id))
            .toEqual(['6', '5', '4', '3', '2']);
    });

    it('moves a selected location to the front without duplicating it', () => {
        service.add(poland, { id: '1', name: 'Warsaw' });
        service.add(poland, { id: '2', name: 'Kraków' });
        service.add(poland, { id: '1', name: 'Warsaw' });

        expect(service.get(poland).map(location => location.id))
            .toEqual(['1', '2']);
    });

    it('keeps separate histories for different countries', () => {
        service.add(poland, { id: '1', name: 'Warsaw' });
        service.add(germany, { id: '2', name: 'Berlin' });

        expect(service.get(poland).map(location => location.name)).toEqual(['Warsaw']);
        expect(service.get(germany).map(location => location.name)).toEqual(['Berlin']);
    });

    it('preserves coordinates in cached locations', () => {
        service.add(poland, {
            id: '1',
            name: 'Wrocław',
            latitude: '51,1',
            longitude: '17,03333'
        });

        expect(service.get(poland)[0]).toMatchObject({
            latitude: '51,1',
            longitude: '17,03333'
        });
    });
});
