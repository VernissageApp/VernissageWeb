import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { UsersDialogContext, UsersListType } from './users-dialog-context';

@Component({
    selector: 'app-users-dialog',
    templateUrl: 'users.dialog.html'
})
export class UsersDialog implements OnInit {
    users?: LinkableResult<User>
    allUsersDisplayed = false;
    title = '';
    statusId = '';
    followingRelationships?: Relationship[] = [];

    constructor(
        private statusesService: StatusesService,
        public dialogRef: MatDialogRef<UsersDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: UsersDialogContext) {
    }

    async ngOnInit(): Promise<void> {
        const usersDialogConext = this.data;
        if (!usersDialogConext) {
            return;
        }

        this.title = usersDialogConext.title;
        this.statusId = usersDialogConext.statusId;
        this.users = await this.getUsers();
    }

    async onLoadMoreFollowing(): Promise<void> {
        const internalUsers = await this.getUsers();

        if (this.users) {
            if (internalUsers.data.length > 0) {
                this.users.data.push(...internalUsers.data);
                this.users.minId = internalUsers.minId;
                this.users.maxId = internalUsers.maxId;
            } else {
                this.allUsersDisplayed = true;
            }
        } else {
            this.users = internalUsers;

            if (this.users.data.length === 0) {
                this.allUsersDisplayed = true;
            }
        }
    }
    
    onNoClick(): void {
        this.dialogRef.close();
    }

    private async getUsers(): Promise<LinkableResult<User>> {
        switch (this.data?.usersListType) {
            case UsersListType.favourited:
                return this.statusesService.favourited(this.statusId, undefined, this.users?.maxId, undefined, undefined);
            default:
                return this.statusesService.reblgged(this.statusId, undefined, this.users?.maxId, undefined, undefined);
        }
    }
}
