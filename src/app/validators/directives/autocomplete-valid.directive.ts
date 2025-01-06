import { Directive, input } from '@angular/core';
import { NG_VALIDATORS, Validator, UntypedFormControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[appAutocompleteValid]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: AutocompleteValidDirective,
            multi: true
        }],
    standalone: false
})

export class AutocompleteValidDirective implements Validator {
    public appAutocompleteValid = input(true);

    validate(formControl: UntypedFormControl): ValidationErrors | null {
        if (!this.appAutocompleteValid()) {
            return null;
        }

        if (!formControl.value) {
            return null;
        }

        const isCorrect = this.isObject(formControl.value);
        return isCorrect ? null : { appAutocompleteValid: { valid: false } };
    }

    private isObject(obj: any): boolean {
        return obj != null && obj.constructor.name === 'Object';
    }
}
