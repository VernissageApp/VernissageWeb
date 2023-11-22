import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role } from 'src/app/models/role';
import { User } from 'src/app/models/user';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'user-roles',
    templateUrl: 'user-roles.dialog.html'
})
export class UserRolesDialog implements OnInit {
    isAdministrator = false;
    isModerator = false;
    isMember = true;

    constructor(
        private usersService: UsersService,
        private messageService: MessagesService,
        public dialogRef: MatDialogRef<UserRolesDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: User) {
    }

    ngOnInit(): void {
        this.isAdministrator = this.data?.roles?.includes(Role.Administrator) ?? false;
        this.isModerator = this.data?.roles?.includes(Role.Moderator) ?? false;
    }

    async onChangeAdministrator(): Promise<void> {
        if (this.data?.userName) {
            try {
                if (this.isAdministrator) {
                    this.usersService.connect(this.data?.userName, Role.Administrator);

                    this.data.roles?.push(Role.Administrator);
                    this.messageService.showSuccess('Role has been connected.');
                } else {
                    this.usersService.disconnect(this.data?.userName, Role.Administrator);

                    const index = this.data.roles?.indexOf(Role.Administrator, 0) ?? -1;
                    if (index > -1) {
                        this.data.roles?.splice(index, 1);
                    }

                    this.messageService.showSuccess('Role has been disconnected.');
                }
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    async onChangeModerator(): Promise<void> {
        if (this.data?.userName) {
            try {
                if (this.isModerator) {
                    this.usersService.connect(this.data?.userName, Role.Moderator);

                    this.data.roles?.push(Role.Moderator);
                    this.messageService.showSuccess('Role has been connected.');
                } else {
                    this.usersService.disconnect(this.data?.userName, Role.Moderator);

                    const index = this.data.roles?.indexOf(Role.Moderator, 0) ?? -1;
                    if (index > -1) {
                        this.data.roles?.splice(index, 1);
                    }

                    this.messageService.showSuccess('Role has been disconnected.');
                }
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({});
    }
}