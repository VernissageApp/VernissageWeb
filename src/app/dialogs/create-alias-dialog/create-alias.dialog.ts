import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserAlias } from 'src/app/models/user-alias';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserAliasesService } from 'src/app/services/http/user-aliases.service';

@Component({
    selector: 'app-create-alias-dialog',
    templateUrl: 'create-alias.dialog.html',
    styleUrls: ['create-alias.dialog.scss']
})
export class CreateAliasDialog {
    alias = '';

    constructor(
        private messageService: MessagesService,
        private userAliasesService: UserAliasesService,
        public dialogRef: MatDialogRef<CreateAliasDialog>) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        try {
            const newUserAlias = new UserAlias();
            newUserAlias.alias = this.alias;

            await this.userAliasesService.create(newUserAlias);
            this.messageService.showSuccess('New account alias has been created.');

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}