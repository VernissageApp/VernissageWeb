import { Directive, inject, input } from '@angular/core';
import { FormControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { GeohashService } from 'src/app/services/common/geohash.service';

@Directive({
    selector: '[appGeohashValid]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: GeohashValidatorDirective,
        multi: true
    }]
})
export class GeohashValidatorDirective implements Validator {
    public appGeohashValid = input(true);
    private geohashService = inject(GeohashService);

    public validate(formControl: FormControl): ValidationErrors | null {
        if (!this.appGeohashValid()) {
            return null;
        }

        return this.geohashService.isValid(formControl.value)
            ? null
            : { appGeohashValid: { valid: false } };
    }
}
