import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessageSnackbarComponent, ErrorMessageSnackbarData } from 'src/app/components/widgets/error-message-snackbar/error-message-snackbar.component';
import { ErrorParserService } from './error-parser.service';

@Injectable({
    providedIn: 'root'
})
export class MessagesService {
    private matSnackBar = inject(MatSnackBar);
    private translateService = inject(TranslateService);
    private errorParserService = inject(ErrorParserService);

    showSuccess(message: string): void {
        this.matSnackBar.open(message, this.translateService.instant('common.actions.dismiss'), {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['message-success']
        });
    }

    showError(message: string, error?: any): void {
        if (error !== undefined) {
            this.matSnackBar.openFromComponent(ErrorMessageSnackbarComponent, {
                data: {
                    message: message,
                    details: this.errorParserService.getStringFromError(error),
                    detailsLabel: this.translateService.instant('common.labels.details'),
                    copyLabel: this.translateService.instant('common.actions.copy'),
                    dismiss: this.translateService.instant('common.actions.dismiss')
                } as ErrorMessageSnackbarData,
                verticalPosition: 'top',
                panelClass: ['message-error']
            });

            return;
        }

        this.matSnackBar.open(message, this.translateService.instant('common.actions.dismiss'), {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['message-error']
        });
    }

    showServerError(error: any): void {
        this.matSnackBar.open(this.getServerErrorMessage(error), this.translateService.instant('common.actions.dismiss'), {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['message-error']
        });
    }

    private getServerErrorMessage(error: any): string {
        const response = error?.error;
        const identifier = this.normalizeTranslationKeySegment(response?.identifier);
        const code = this.normalizeTranslationKeySegment(response?.code);

        if (identifier && code) {
            const translationKey = `errors.${identifier}.${code}`;
            const translatedMessage = this.translateService.instant(translationKey, response?.parameters ?? {});

            if (translatedMessage !== translationKey) {
                return translatedMessage;
            }
        }

        return response?.reason ?? this.translateService.instant('common.messages.unknownError');
    }

    private normalizeTranslationKeySegment(value: unknown): string | null {
        if (typeof value !== 'string' || value.length === 0) {
            return null;
        }

        return value.replace(/[-_]+([a-zA-Z0-9])/g, (_, character: string) => character.toUpperCase());
    }
}
