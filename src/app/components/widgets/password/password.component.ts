import { Component, signal, output, viewChild, input, ChangeDetectionStrategy, linkedSignal } from '@angular/core';
import { NgForm, NgModel, FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { PasswordValidatorDirective } from '../../../validators/directives/password-validator.directive';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, MatInput, FormsModule, PasswordValidatorDirective, MatIconButton, MatSuffix, MatIcon, MatError, TranslatePipe]
})
export class PasswordComponent {
    public passwordText = input<string>();
    public passwordValue = linkedSignal(this.passwordText);
    public passwordTextChange = output<string>();

    public form = input<NgForm | undefined>();
    public passwordValid = output<boolean>();

    protected isPasswordVisible = signal(false);

    private password = viewChild<NgModel | undefined>('password');

    protected togglePassword(): void {
        this.isPasswordVisible.update(value => !value);
    }

    protected passwordChanged(): void {
        this.passwordTextChange.emit(this.passwordValue() ?? '');
        this.passwordValid.emit(this.password()?.valid ?? false);
    }
}
