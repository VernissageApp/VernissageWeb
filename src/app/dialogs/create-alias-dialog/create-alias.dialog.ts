import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserAlias } from 'src/app/models/user-alias';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserAliasesService } from 'src/app/services/http/user-aliases.service';

@Component({
    selector: 'app-create-alias-dialog',
    templateUrl: 'create-alias.dialog.html',
    styleUrls: ['create-alias.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CreateAliasDialog {
    protected alias = model('');

    private messageService = inject(MessagesService);
    private userAliasesService = inject(UserAliasesService);
    private dialogRef = inject(MatDialogRef<CreateAliasDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            const newUserAlias = new UserAlias();
            newUserAlias.alias = this.alias();

            await this.userAliasesService.create(newUserAlias);
            this.messageService.showSuccess('New account alias has been created.');

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}