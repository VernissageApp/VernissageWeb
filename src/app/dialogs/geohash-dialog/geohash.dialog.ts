import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { InputActivityDirective } from 'src/app/directives/input-activity.directive';
import { GeohashService } from 'src/app/services/common/geohash.service';
import { GeohashValidatorDirective } from 'src/app/validators/directives/geohash-validator.directive';

export interface GeohashDialogResult {
    latitude: string;
    longitude: string;
}

@Component({
    selector: 'app-geohash-dialog',
    templateUrl: 'geohash.dialog.html',
    styleUrl: 'geohash.dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, GeohashValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class GeohashDialog {
    protected geohash = model('');
    protected latitude = signal('');
    protected longitude = signal('');

    private dialogRef = inject(MatDialogRef<GeohashDialog, GeohashDialogResult>);
    private geohashService = inject(GeohashService);

    protected onGeohashChange(value: string): void {
        const coordinates = this.geohashService.decode(value);
        this.latitude.set(coordinates ? coordinates.latitude.toString() : '');
        this.longitude.set(coordinates ? coordinates.longitude.toString() : '');
    }

    protected onCancel(): void {
        this.dialogRef.close();
    }

    protected onSubmit(): void {
        const coordinates = this.geohashService.decode(this.geohash());
        if (!coordinates) {
            return;
        }

        this.dialogRef.close({
            latitude: coordinates.latitude.toString(),
            longitude: coordinates.longitude.toString()
        });
    }
}
