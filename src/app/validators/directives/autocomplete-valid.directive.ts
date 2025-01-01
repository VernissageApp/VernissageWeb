import { Directive, Input } from '@angular/core';
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
    @Input() appAutocompleteValid = true;

    validate(formControl: UntypedFormControl): ValidationErrors | null {
        if (!this.appAutocompleteValid) {
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
