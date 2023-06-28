import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';
import { AccountMode } from 'src/app/models/account-mode';
import { ChangePassword } from 'src/app/models/change-password';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
// import { AccountService } from 'src/app/services/http/account.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';


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
        // private accountService: AccountService,
        private authorizationService: AuthorizationService,
        private messageService: MessagesService,
        private router: Router,
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
            this.router.navigate(['/home']);
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
                this.authorizationService.refreshAccessToken();
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
/*
    async submitChangePassword(): Promise<void> {
        try {
            await this.accountService.changePassword(this.changePassword);
            this.changePasswordModalRef.hide();
            this.messageService.showSuccess('Password was changed.');
        } catch {
            this.changePasswordErrorMessage = 'Unexpected error occurred. Please try again.';
        }
    }

    closeChangePassword(): void {
        this.changePassword.currentPassword = '';
        this.changePassword.newPassword = '';
        this.changePasswordErrorMessage = null;

        this.changePasswordModalRef.hide();
    }

    async onDeleteAccount(): Promise<void> {
        try {
            await this.usersService.delete(this.userNameToDelete);
            this.deleteAccountModalRef.hide();
            this.toastrService.success('Your account was deleted.');

            this.authorizationService.signOut();
            this.router.navigate(['/home']);
        } catch {
            this.errorMessage = 'Unexpected error occurred. Please try again.';
        }
    }

    openChangePasswordModal(template: TemplateRef<any>) {
        this.changePasswordModalRef = this.modalService.show(template);
    }

    openDeleteAccountModal(template: TemplateRef<any>) {
        this.deleteAccountModalRef = this.modalService.show(template);
    }
*/
    isAccountMode(): boolean {
        return this.accountMode === AccountMode.Account;
    }

    isSubmittingMode(): boolean {
        return this.accountMode === AccountMode.Submitting;
    }

    isSuccessMode(): boolean {
        return this.accountMode === AccountMode.Success;
    }

    isErrorMode(): boolean {
        return this.accountMode === AccountMode.Error;
    }
}
