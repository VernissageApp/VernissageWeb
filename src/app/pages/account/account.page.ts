import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';
import { AccountMode } from 'src/app/models/account-mode';
import { ChangePassword } from 'src/app/models/change-password';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import {MatDialog} from "@angular/material/dialog";
import {ChangePasswordDialog} from "../../dialogs/change-password-dialog/change-password.dialog";

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
    animations: fadeInAnimation
})
export class AccountPage implements OnInit {

    user: User = new User();
    accountMode = AccountMode.Account;
    changePassword = new ChangePassword();
    isReady = false;

    userNameToDelete?: string;
    errorMessage?: string;
    changePasswordErrorMessage?: string;

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
                this.user = await this.usersService.profile(userFromToken?.userName);
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

    openChangePasswordDialog(): void {
        const dialogRef = this.dialog.open(ChangePasswordDialog);
    }

    isSubmittingMode(): boolean {
        return this.accountMode === AccountMode.Submitting;
    }
}
