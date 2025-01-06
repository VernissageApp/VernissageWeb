import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { UsersDialogContext, UsersListType } from './users-dialog-context';

@Component({
    selector: 'app-users-dialog',
    templateUrl: 'users.dialog.html',
    styleUrls: ['./users.dialog.scss'],
    standalone: false
})
export class UsersDialog implements OnInit {
    protected users = signal<LinkableResult<User> | undefined>(undefined);
    protected allUsersDisplayed = signal(false);
    protected title = signal('');
    protected followingRelationships = signal<Relationship[]>([]);

    private statusId = '';

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

        this.title.set(usersDialogConext.title);
        this.statusId = usersDialogConext.statusId;

        const downloadedUsers = await this.getUsers();
        this.users.set(downloadedUsers);
    }

    protected async onLoadMoreFollowing(): Promise<void> {
        const internalUsers = await this.getUsers();

        if (this.users()) {
            if (internalUsers.data.length > 0) {
                this.users.update((usersArray) => {
                    if (usersArray) {
                        usersArray.data.push(...internalUsers.data);
                        usersArray.minId = internalUsers.minId;
                        usersArray.maxId = internalUsers.maxId;
                    }

                    return usersArray;
                });
            } else {
                this.allUsersDisplayed.set(true);
            }
        } else {
            this.users.set(internalUsers);

            if (this.users()?.data.length === 0) {
                this.allUsersDisplayed.set(true);
            }
        }
    }
    
    protected onNoClick(): void {
        this.dialogRef.close();
    }

    private async getUsers(): Promise<LinkableResult<User>> {
        switch (this.data?.usersListType) {
            case UsersListType.favourited:
                return this.statusesService.favourited(this.statusId, undefined, this.users()?.maxId, undefined, undefined);
            default:
                return this.statusesService.reblgged(this.statusId, undefined, this.users()?.maxId, undefined, undefined);
        }
    }
}
