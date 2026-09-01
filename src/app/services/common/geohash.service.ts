import { Injectable } from '@angular/core';

const geohashAlphabet = '0123456789bcdefghjkmnpqrstuvwxyz';
const geohashCharacterPattern = /^[0123456789bcdefghjkmnpqrstuvwxyz]{1,12}$/i;

export interface GeohashCoordinates {
    latitude: number;
    longitude: number;
}

@Injectable({ providedIn: 'root' })
export class GeohashService {
    public isValid(value: unknown): value is string {
        return typeof value === 'string' && geohashCharacterPattern.test(value.trim());
    }

    public decode(value: string): GeohashCoordinates | undefined {
        const normalizedValue = value.trim().toLowerCase();
        if (!this.isValid(normalizedValue)) {
            return undefined;
        }

        let latitudeMinimum = -90;
        let latitudeMaximum = 90;
        let longitudeMinimum = -180;
        let longitudeMaximum = 180;
        let isLongitudeBit = true;

        for (const character of normalizedValue) {
            const characterValue = geohashAlphabet.indexOf(character);

            for (const bitMask of [16, 8, 4, 2, 1]) {
                if (isLongitudeBit) {
                    const midpoint = (longitudeMinimum + longitudeMaximum) / 2;
                    if ((characterValue & bitMask) !== 0) {
                        longitudeMinimum = midpoint;
                    } else {
                        longitudeMaximum = midpoint;
                    }
                } else {
                    const midpoint = (latitudeMinimum + latitudeMaximum) / 2;
                    if ((characterValue & bitMask) !== 0) {
                        latitudeMinimum = midpoint;
                    } else {
                        latitudeMaximum = midpoint;
                    }
                }

                isLongitudeBit = !isLongitudeBit;
            }
        }

        return {
            latitude: (latitudeMinimum + latitudeMaximum) / 2,
            longitude: (longitudeMinimum + longitudeMaximum) / 2
        };
    }
}
