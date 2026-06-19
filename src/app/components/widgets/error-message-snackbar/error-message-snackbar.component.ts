import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ErrorMessageSnackbarData {
    message: string;
    details: string;
    detailsLabel: string;
    copyLabel: string;
    dismiss: string;
}

@Component({
    selector: 'app-error-message-snackbar',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './error-message-snackbar.component.html',
    styleUrls: ['./error-message-snackbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageSnackbarComponent {
    protected data = inject<ErrorMessageSnackbarData>(MAT_SNACK_BAR_DATA);
    protected isExpanded = signal(false);

    private snackBarRef = inject(MatSnackBarRef<ErrorMessageSnackbarComponent>);
    private clipboard = inject(Clipboard);

    protected toggleDetails(): void {
        this.isExpanded.update((value) => !value);
    }

    protected dismiss(): void {
        this.snackBarRef.dismiss();
    }

    protected copyDetails(): void {
        this.clipboard.copy(this.data.details);
    }
}
