import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-profile-code-dialog',
    templateUrl: 'profile-code.dialog.html',
    styleUrls: ['profile-code.dialog.scss'],
    standalone: false
})
export class ProfileCodeDialog implements OnInit {
    protected profileUrl = signal('');
    protected isLightTheme = signal(false);

    private userName = '';

    constructor(
        public dialogRef: MatDialogRef<ProfileCodeDialog>,
        public preferencesService: PreferencesService,
        private windowService: WindowService,
        @Inject(MAT_DIALOG_DATA) public data?: string) {
    }

    ngOnInit(): void {
        if (this.data) {
            this.userName = this.data;

            this.profileUrl.set(this.windowService.getApplicationBaseUrl() + '/users/@' + this.userName);
            this.isLightTheme.set(this.preferencesService.isLightTheme);
        }
    }
}