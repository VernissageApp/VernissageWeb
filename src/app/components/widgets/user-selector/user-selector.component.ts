import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, input, output, signal, inject, linkedSignal } from '@angular/core';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { debounceTime, switchMap } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/http/users.service';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { AutocompleteValidDirective } from '../../../validators/directives/autocomplete-valid.directive';
import { MatOption } from '@angular/material/select';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-user-selector',
    templateUrl: './user-selector.component.html',
    styleUrls: ['./user-selector.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatFormField, MatLabel, InputActivityDirective, MatInput, FormsModule, MatAutocompleteTrigger, AutocompleteValidDirective, MatAutocomplete, MatOption, MatIconButton, MatSuffix, MatIcon, MatProgressSpinner, MatError, TranslatePipe]
})
export class UserSelectorComponent implements OnInit, OnDestroy {
    public name = input.required<string>();
    public label = input('');
    public isRequired = input(false);
    public isReadOnly = input(false);

    public selectedUser = input<User>();
    public selectedUserValue = linkedSignal(this.selectedUser);
    public selectedUserChange = output<User | undefined>();

    protected filteredUsers = signal<User[] | undefined>(undefined);
    protected isUsersLoading = signal(false);

    private usersSubscription?: Subscription;
    private textChanged = new Subject<string>();

    private usersService = inject(UsersService);

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
        });
    }

    ngOnDestroy(): void {
        this.usersSubscription?.unsubscribe();
    }

    protected onSelectedUser(user: User): void {
        this.selectedUserValue.set(user);
        this.selectedUserChange.emit(user);
    }

    protected onChange(): void {
        this.selectedUserValue.set(undefined);
        this.selectedUserChange.emit(undefined);
    }

    protected onModelChange(value: string): void {
        this.textChanged.next(value);
    }

    protected userDisplayFn(user: User): string  {
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

        this.selectedUserValue.set(undefined);
        this.selectedUserChange.emit(undefined);

        const result = await this.usersService.get(0, 40, value);
        return result.data;
    }
}
