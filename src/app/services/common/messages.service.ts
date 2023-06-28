import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    constructor(private matSnackBar: MatSnackBar) {
    }

    showSuccess(message: string): void {
        this.matSnackBar.open(message, 'Dismiss', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['message-success']
        });
    }

    showError(message: string): void {
        this.matSnackBar.open(message, 'Dismiss', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['message-error']
        });
    }
}
