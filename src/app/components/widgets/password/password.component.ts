import { Component, signal, output, model, viewChild, input, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PasswordComponent {
    public passwordText = model<string>();
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
