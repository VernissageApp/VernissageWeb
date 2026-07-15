import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UsersService } from 'src/app/services/http/users.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-restore-account-dialog',
    templateUrl: 'restore-account.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class RestoreAccountDialog implements OnInit {
    protected password = model('');

    public dialogRef = inject(MatDialogRef<RestoreAccountDialog>);
    public messageService = inject(MessagesService);
    public usersService = inject(UsersService);
    public authorizationService = inject(AuthorizationService);

    private data?: string = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);
    private userName = '';

    ngOnInit(): void {
        if (this.data) {
            this.userName = this.data;
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            await this.usersService.unmove(this.userName, this.password());
            await this.authorizationService.refreshAccessToken();

            this.messageService.showSuccess(this.translateService.instant('dialogs.restoreAccount.messages.accountHasBeenRestored'));
            this.dialogRef.close(true);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }        
    }
}