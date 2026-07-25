import { inject, Injectable } from '@angular/core';
import { Country } from 'src/app/models/country';
import { Location } from 'src/app/models/location';
import { PersistenceService } from '../persistance/persistance.service';

type LocationsByCountry = Record<string, Location[]>;

@Injectable({
    providedIn: 'root'
})
export class RecentLocationsService {
    private readonly cacheKey = 'recent-locations-by-country';
    private readonly maximumLocationsPerCountry = 5;

    private persistenceService = inject(PersistenceService);

    public get(country?: Country): Location[] {
        const countryKey = this.getCountryKey(country);
        if (!countryKey) {
            return [];
        }

        const locationsByCountry = this.getLocationsByCountry();
        const locations = locationsByCountry[countryKey];

        return Array.isArray(locations)
            ? locations.slice(0, this.maximumLocationsPerCountry)
            : [];
    }

    public add(country?: Country, location?: Location): void {
        const countryKey = this.getCountryKey(country ?? location?.country);
        if (!countryKey || !location) {
            return;
        }

        const locationsByCountry = this.getLocationsByCountry();
        const recentLocations = Array.isArray(locationsByCountry[countryKey])
            ? locationsByCountry[countryKey]
            : [];
        const locationKey = this.getLocationKey(location);

        locationsByCountry[countryKey] = [
            location,
            ...recentLocations.filter(recentLocation => this.getLocationKey(recentLocation) !== locationKey)
        ].slice(0, this.maximumLocationsPerCountry);

        this.persistenceService.setJson(this.cacheKey, locationsByCountry);
    }

    private getLocationsByCountry(): LocationsByCountry {
        const persistedValue = this.persistenceService.getJson(this.cacheKey);
        if (!persistedValue || typeof persistedValue !== 'object' || Array.isArray(persistedValue)) {
            return {};
        }

        return persistedValue as LocationsByCountry;
    }

    private getCountryKey(country?: Country): string | undefined {
        if (country?.code) {
            return `code:${country.code.toUpperCase()}`;
        }

        return country?.id ? `id:${country.id}` : undefined;
    }

    private getLocationKey(location: Location): string {
        if (location.id) {
            return `id:${location.id}`;
        }

        return `name:${location.name?.trim().toLocaleLowerCase() ?? ''}`;
    }
}
