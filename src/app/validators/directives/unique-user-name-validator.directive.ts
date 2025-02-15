import { Directive } from '@angular/core';
import { NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { RegisterService } from 'src/app/services/http/register.service';

@Directive({
    selector: '[appUniqueUserName]',
    providers: [
        { provide: NG_ASYNC_VALIDATORS, useExisting: UniqueUserNameValidatorDirective, multi: true }
    ],
    standalone: false
})
export class UniqueUserNameValidatorDirective implements AsyncValidator {

    constructor(private registerService: RegisterService) {
    }

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return timer(500).pipe(
            switchMap(() => {
                if (!control.value) {
                    return of(null);
                }

                return this.registerService.isUserNameTaken(control.value).pipe(
                    map(response => {
                        if (response.result) {
                            return { appUniqueUserName: { error: 'User name is already taken.', actualValue: control.value } };
                        }

                        return null;
                    })
                );
            })
        );
    }
}
