import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

export class DirtyErrorStateMatcher implements ErrorStateMatcher {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        // show error only when dirty and invalid
        return control != null && control.dirty && control.invalid;
    }
}
