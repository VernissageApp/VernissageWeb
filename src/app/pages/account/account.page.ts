import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';
import { AccountMode } from 'src/app/models/account-mode';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { MatDialog } from "@angular/material/dialog";
import { ChangePasswordDialog } from "../../dialogs/change-password-dialog/change-password.dialog";
import { FlexiField } from "../../models/flexi-field";

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
    animations: fadeInAnimation
})
export class AccountPage implements OnInit {

    userName = '';
    user: User = new User();
    accountMode = AccountMode.Account;
    isReady = false;
    errorMessage?: string;

    selectedAvatarFile: any = null;
    avatarSrc?: string;

    selectedHeaderFile: any = null;
    headerSrc?: string

    constructor(
        private usersService: UsersService,
        private accountService: AccountService,
        private authorizationService: AuthorizationService,
        private messageService: MessagesService,
        private router: Router,
        public dialog: MatDialog,
        private loadingService: LoadingService
    ) { }

    async ngOnInit(): Promise<void> {
        try {
            this.loadingService.showLoader();

            const userFromToken = this.authorizationService.getUser();
            if (userFromToken?.userName != null) {
                this.userName = userFromToken?.userName;
                await this.loadUserData()
            } else {
                this.messageService.showError('Cannot download user settings.');
            }
        } catch {
            this.messageService.showError('Error during downloading user settings.');
            await this.router.navigate(['/home']);
        } finally {
            this.isReady = true;
            this.loadingService.hideLoader();
        }
    }

    async onSubmit(): Promise<void> {
        try {
            this.accountMode = AccountMode.Submitting;

            if (this.user.userName != null) {
                await this.usersService.update(this.user.userName, this.user);
                this.accountMode = AccountMode.Success;
                await this.authorizationService.refreshAccessToken();

                this.messageService.showSuccess('Settings was saved.');
            } else {
                this.errorMessage = 'Cannot save. User name is required.';
            }
        } catch (error) {
            console.error(error);
            this.errorMessage = 'Unexpected error occurred. Please try again.';
            this.accountMode = AccountMode.Error;
        }
    }

    async onAvatarFormSubmit(): Promise<void> {
        try {
            if (this.selectedAvatarFile) {
                const formData = new FormData();
                formData.append('file', this.selectedAvatarFile);

                await this.usersService.uploadAvatar(this.userName, formData);
                await this.loadUserData()
                this.messageService.showSuccess('Avatar has ben saved.');
            }
        } catch (error) {
            console.error(error);
            this.errorMessage = 'Unexpected error occurred. Please try again.';
            this.accountMode = AccountMode.Error;
        }
    }

    async onRemoveAvatar(): Promise<void> {
        try {
            if (this.user.avatarUrl) {
                await this.usersService.deleteAvatar(this.userName);
                await this.loadUserData()
                this.messageService.showSuccess('Avatar has ben deleted.');
            }
        } catch (error) {
            console.error(error);
            this.errorMessage = 'Unexpected error occurred. Please try again.';
            this.accountMode = AccountMode.Error;
        }
    }

    async onHeaderFormSubmit(): Promise<void> {
        try {
            if (this.selectedHeaderFile) {
                const formData = new FormData();
                formData.append('file', this.selectedHeaderFile);

                await this.usersService.uploadHeader(this.userName, formData);
                await this.loadUserData()
                this.messageService.showSuccess('Header has ben saved.');
            }
        } catch (error) {
            console.error(error);
            this.errorMessage = 'Unexpected error occurred. Please try again.';
            this.accountMode = AccountMode.Error;
        }
    }

    async onRemoveHeader(): Promise<void> {
        try {
            if (this.user.headerUrl) {
                await this.usersService.deleteHeader(this.userName);
                await this.loadUserData()
                this.messageService.showSuccess('Header has ben deleted.');
            }
        } catch (error) {
            console.error(error);
            this.errorMessage = 'Unexpected error occurred. Please try again.';
            this.accountMode = AccountMode.Error;
        }
    }

    onAddField(): void {
        this.user.fields?.push(new FlexiField())
    }

    onDeleteField(flexiField: FlexiField): void {
        const index = this.user.fields?.indexOf(flexiField);
        if (index != undefined) {
            this.user.fields?.splice(index, 1);
        }
    }

    onAvatarSelected(event: any): void {
        this.selectedAvatarFile = event.target.files[0] ?? null;

        if (this.selectedAvatarFile) {
            const reader = new FileReader();
            reader.onload = e => this.avatarSrc = reader.result as string;
            reader.readAsDataURL(this.selectedAvatarFile);
        }
    }

    onHeaderSelected(event: any): void {
        this.selectedHeaderFile = event.target.files[0] ?? null;

        if (this.selectedHeaderFile) {
            const reader = new FileReader();
            reader.onload = e => this.headerSrc = reader.result as string;
            reader.readAsDataURL(this.selectedHeaderFile);
        }
    }

    openChangePasswordDialog(): void {
        this.dialog.open(ChangePasswordDialog);
    }

    isSubmittingMode(): boolean {
        return this.accountMode === AccountMode.Submitting;
    }

    private async loadUserData(): Promise<void> {
        this.user = await this.usersService.profile(this.userName);
        this.avatarSrc = this.user.avatarUrl ?? 'assets/avatar.png';
        this.headerSrc = this.user.headerUrl ?? 'assets/avatar.png';

        if (this.user.fields?.length === 0) {
            this.user.fields.push(new FlexiField());
        }
    }
}
