import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UniqueEmailValidatorDirective } from './directives/unique-email-validator.directive';
import { UniqueUserNameValidatorDirective } from './directives/unique-user-name-validator.directive';
import { PasswordValidatorDirective } from './directives/password-validator.directive';
import { MaxLengthValidatorDirective } from './directives/max-length-validator.directive';
import { AutocompleteValidDirective } from './directives/autocomplete-valid.directive';

@NgModule({
    declarations: [
        UniqueEmailValidatorDirective,
        UniqueUserNameValidatorDirective,
        PasswordValidatorDirective,
        MaxLengthValidatorDirective,
        AutocompleteValidDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        UniqueEmailValidatorDirective,
        UniqueUserNameValidatorDirective,
        PasswordValidatorDirective,
        MaxLengthValidatorDirective,
        AutocompleteValidDirective
    ]
})
export class ValidationsModule { }
