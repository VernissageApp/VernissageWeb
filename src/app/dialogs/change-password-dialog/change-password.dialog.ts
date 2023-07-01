import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'change-password',
    templateUrl: 'change-password.dialog.html'
})
export class ChangePasswordDialog {
    oldPassword = '';
    password = '';
    passwordIsValid = true;

    constructor(
        public dialogRef: MatDialogRef<ChangePasswordDialog>
    ) {}

    passwordValid(valid: boolean): void {
        this.passwordIsValid = valid;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
    }
}