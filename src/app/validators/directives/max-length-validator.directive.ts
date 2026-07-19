import { Directive, input, numberAttribute } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[appMaxLength]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: MaxLengthValidatorDirective,
            multi: true
        }]
})

export class MaxLengthValidatorDirective implements Validator {

    readonly maxLength = input(0, { alias: 'appMaxLength', transform: numberAttribute });

    validate(formControl: FormControl): ValidationErrors | null {
        const maxLength = this.maxLength();
        if (!formControl.value || !maxLength) {
            return null;
        }

        const isCorrect = formControl.value.length > maxLength ? false : true;
        return isCorrect ? null : { appMaxLength: { valid: false } };
    }
}
