import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FileSizeService {

    public getHumanFileSize(bytes: number, places: number) {
        const thresh = 1024;
        const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        let u = -1;
        const r = 10**places;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(places) + ' ' + units[u];
    }
}
