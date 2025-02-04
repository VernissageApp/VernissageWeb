import { ChangeDetectionStrategy, Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-profile-code-dialog',
    templateUrl: 'profile-code.dialog.html',
    styleUrls: ['profile-code.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProfileCodeDialog implements OnInit {
    protected profileUrl = signal('');
    protected isLightTheme = signal(false);

    constructor(
        public dialogRef: MatDialogRef<ProfileCodeDialog>,
        public preferencesService: PreferencesService,
        @Inject(MAT_DIALOG_DATA) public data?: string) {
    }

    ngOnInit(): void {
        if (this.data) {
            this.profileUrl.set(this.data);
            this.isLightTheme.set(this.preferencesService.isLightTheme);
        }
    }
}