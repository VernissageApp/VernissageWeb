import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[appMaxLength]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: MaxLengthValidatorDirective,
            multi: true
        }],
    standalone: false
})

export class MaxLengthValidatorDirective implements Validator {

    private lenght?: number;

    @Input('appMaxLength') set maxLength(value: string) {
        this.lenght = Number(value);
    }

    validate(formControl: FormControl): ValidationErrors | null {
        if (!formControl.value || !this.lenght) {
            return null;
        }

        const isCorrect = formControl.value.length > this.lenght ? false : true;
        return isCorrect ? null : { appMaxLength: { valid: false } };
    }
}
