import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RandomGeneratorService {
    readonly characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    

    generateString(length: number) {
        let result = '';
        const charactersLength = this.characters.length;

        let counter = 0;
        while (counter < length) {
          result += this.characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }

        return result;
    }
}
