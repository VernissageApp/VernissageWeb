import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UserAlias } from 'src/app/models/user-alias';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserAliasesService } from 'src/app/services/http/user-aliases.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-create-alias-dialog',
    templateUrl: 'create-alias.dialog.html',
    styleUrls: ['create-alias.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class CreateAliasDialog {
    protected alias = model('');

    private messageService = inject(MessagesService);
    private userAliasesService = inject(UserAliasesService);
    private dialogRef = inject(MatDialogRef<CreateAliasDialog>);
    private translateService = inject(TranslateService);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            const newUserAlias = new UserAlias();
            newUserAlias.alias = this.alias();

            await this.userAliasesService.create(newUserAlias);
            this.messageService.showSuccess(this.translateService.instant('dialogs.createAlias.messages.newAccountAliasHasBeenCreated'));

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}