import { Directive } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, AbstractControl, Validator } from '@angular/forms';

import { PasswordErrors } from '../models/password-errors';

@Directive({
    selector: '[appPassword]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: PasswordValidatorDirective, multi: true }
    ],
    standalone: false
})
export class PasswordValidatorDirective implements Validator {
    private passwordErrors = new PasswordErrors();

    private lowercaseRegexp = new RegExp('[a-z]');
    private uppercaseRegexp = new RegExp('[A-Z]');
    private symbolRegexp = new RegExp('[\\W|_|0-9]');

    validate(control: AbstractControl): ValidationErrors | null {

        if (this.isNullOrUndefined(control.value)) {
            this.passwordErrors.length = true;
            this.passwordErrors.lowercase = true;
            this.passwordErrors.uppercase = true;
            this.passwordErrors.symbol = true;

            return { appPassword: this.passwordErrors };
        }

        if (control.value.length < 8 || control.value.length > 32) {
            this.passwordErrors.length = true;
        } else {
            this.passwordErrors.length = false;
        }

        if (!this.lowercaseRegexp.test(control.value)) {
            this.passwordErrors.lowercase = true;
        } else {
            this.passwordErrors.lowercase = false;
        }

        if (!this.uppercaseRegexp.test(control.value)) {
            this.passwordErrors.uppercase = true;
        } else {
            this.passwordErrors.uppercase = false;
        }

        if (!this.symbolRegexp.test(control.value)) {
            this.passwordErrors.symbol = true;
        } else {
            this.passwordErrors.symbol = false;
        }

        if (this.passwordErrors.isValid()) {
            return null;
        }

        return { appPassword: this.passwordErrors };
    }

    isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
        return typeof obj === 'undefined' || obj === null;
    }
}
