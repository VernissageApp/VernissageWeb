import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, input, model, output, signal } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { debounceTime, switchMap } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-user-selector',
    templateUrl: './user-selector.component.html',
    styleUrls: ['./user-selector.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserSelectorComponent implements OnInit, OnDestroy {
    public name = input.required<string>();
    public label = input('User');
    public isRequired = input(false);
    public isReadOnly = input(false);

    public selectedUser = model<User>();
    public selectedUserChange = output<User | undefined>();

    protected filteredUsers = signal<User[] | undefined>(undefined);
    protected isUsersLoading = signal(false);

    private usersSubscription?: Subscription;
    private textChanged = new Subject<string>();

    constructor(
        private usersService: UsersService,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.usersSubscription = this.textChanged.pipe(
            debounceTime(300),
            switchMap(async value => {
                this.isUsersLoading.set(true);
                return await this.filterUsers(value);
            })
        ).subscribe(users => {
            this.filteredUsers.set(users);
            this.isUsersLoading.set(false);
            this.changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.usersSubscription?.unsubscribe();
    }

    onSelectedUser(user: User): void {
        this.selectedUser.set(user);
        this.selectedUserChange.emit(user);
    }

    onChange(): void {
        this.selectedUser.set(undefined);
        this.selectedUserChange.emit(undefined);
    }

    onModelChange(value: string): void {
        this.textChanged.next(value);
    }

    userDisplayFn(user: User): string  {
        if (!user) {
            return '';
        }

        if (user.name && user.name.length > 0) {
            return `${user.name} (@${user.userName})`;
        }

        return `@${user.userName}`;
    };

    private async filterUsers(value: string): Promise<User[] | undefined> {

        if (typeof value !== 'string') {
            return [];
        }

        this.selectedUser.set(undefined);
        this.selectedUserChange.emit(undefined);

        const result = await this.usersService.get(0, 40, value);
        return result.data;
    }
}
