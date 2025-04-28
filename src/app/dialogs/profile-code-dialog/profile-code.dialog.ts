import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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

    private preferencesService = inject(PreferencesService);
    private data?: string = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        if (this.data) {
            this.profileUrl.set(this.data);
            this.isLightTheme.set(this.preferencesService.isLightTheme);
        }
    }
}
