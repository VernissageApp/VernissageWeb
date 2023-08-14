import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent {
    isPasswordVisible = false;

    @Input() passwordText?: string;
    @Input() form?: NgForm;

    @Output() passwordTextChange = new EventEmitter<string>();
    @Output() passwordValid = new EventEmitter<boolean>();

    @ViewChild('password') password?: NgModel;

    togglePassword(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    passwordChanged(): void {
        this.passwordTextChange.emit(this.passwordText);
        this.passwordValid.emit(this.password?.valid ?? false);
    }
}
