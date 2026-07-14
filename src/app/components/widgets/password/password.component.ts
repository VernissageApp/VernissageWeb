import { Component, signal, output, viewChild, input, ChangeDetectionStrategy, linkedSignal } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PasswordComponent {
    public passwordTextInput = input<string>(undefined, {alias: 'passwordText'});
    public passwordText = linkedSignal(this.passwordTextInput);
    public passwordTextChange = output<string>();

    public form = input<NgForm | undefined>();
    public passwordValid = output<boolean>();

    protected isPasswordVisible = signal(false);

    private password = viewChild<NgModel | undefined>('password');

    protected togglePassword(): void {
        this.isPasswordVisible.update(value => !value);
    }

    protected passwordChanged(): void {
        this.passwordTextChange.emit(this.passwordText() ?? '');
        this.passwordValid.emit(this.password()?.valid ?? false);
    }
}
