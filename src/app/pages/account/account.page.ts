import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { ChangeEmailDialog } from 'src/app/dialogs/change-email-dialog/change-email.dialog';
import { DeleteAccountDialog } from 'src/app/dialogs/delete-account-dialog/delete-account.dialog';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';
import { AvatarsService } from 'src/app/services/http/avatars.service';
import { HeadersService } from 'src/app/services/http/headers.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { WindowService } from 'src/app/services/common/window.service';
import { FlexiField } from 'src/app/models/flexi-field';
import { ResendEmailConfirmation } from 'src/app/models/resend-email-confirmation';
import { ChangePasswordDialog } from 'src/app/dialogs/change-password-dialog/change-password.dialog';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Clipboard } from '@angular/cdk/clipboard';
import { EnableTwoFactorTokenDialog } from 'src/app/dialogs/enable-two-factor-token/enable-two-factor-token.dialog';
import { DisableTwoFactorTokenDialog } from 'src/app/dialogs/disable-two-factor-token/disable-two-factor-token.dialog';
import { CreateAliasDialog } from 'src/app/dialogs/create-alias-dialog/create-alias.dialog';
import { UserAlias } from 'src/app/models/user-alias';
import { UserAliasesService } from 'src/app/services/http/user-aliases.service';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
    animations: fadeInAnimation
})
export class AccountPage extends ResponsiveComponent implements OnInit {

    userName = '';
    verification = '';
    user: User = new User();
    isReady = false;
    twoFactorTokenEnabled = false;

    readonly displayedColumns: string[] = ['alias', 'actions'];
    userAliases: UserAlias[] = [];

    selectedAvatarFile: any = null;
    avatarSrc?: string;

    selectedHeaderFile: any = null;
    headerSrc?: string

    constructor(
        private usersService: UsersService,
        private avatarsService: AvatarsService,
        private headersService: HeadersService,
        private accountService: AccountService,
        private authorizationService: AuthorizationService,
        private userAliasesService: UserAliasesService,
        private messageService: MessagesService,
        private windowService: WindowService,
        private router: Router,
        public dialog: MatDialog,
        private clipboard: Clipboard,
        private loadingService: LoadingService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        try {
            this.loadingService.showLoader();

            const userFromToken = this.authorizationService.getUser();
            if (userFromToken?.userName) {
                this.userName = userFromToken?.userName;
                await this.loadUserData();
                await this.loadUserAliases();
            } else {
                this.messageService.showError('Cannot download user settings.');
            }

            const applicationBaseUrl = this.windowService.getApplicationBaseUrl()
            this.verification = `<a rel="me" href="${applicationBaseUrl}/@${this.user.userName}">Vernissage</a>`;
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
            if (this.user.userName != null) {
                await this.usersService.update(this.user.userName, this.user);
                await this.authorizationService.refreshAccessToken();

                this.messageService.showSuccess('Settings was saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onAvatarFormSubmit(): Promise<void> {
        try {
            if (this.selectedAvatarFile) {
                const formData = new FormData();
                formData.append('file', this.selectedAvatarFile);

                await this.avatarsService.uploadAvatar(this.userName, formData);
                await this.loadUserData();
                this.messageService.showSuccess('Avatar has ben saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onRemoveAvatar(): Promise<void> {
        try {
            if (this.user.avatarUrl) {
                await this.avatarsService.deleteAvatar(this.userName);
                await this.loadUserData()
                this.messageService.showSuccess('Avatar has ben deleted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onHeaderFormSubmit(): Promise<void> {
        try {
            if (this.selectedHeaderFile) {
                const formData = new FormData();
                formData.append('file', this.selectedHeaderFile);

                await this.headersService.uploadHeader(this.userName, formData);
                await this.loadUserData();
                this.messageService.showSuccess('Header has ben saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onRemoveHeader(): Promise<void> {
        try {
            if (this.user.headerUrl) {
                await this.headersService.deleteHeader(this.userName);
                await this.loadUserData();
                this.messageService.showSuccess('Header has ben deleted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
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
            reader.onload = () => this.avatarSrc = reader.result as string;
            reader.readAsDataURL(this.selectedAvatarFile);
        }
    }

    onHeaderSelected(event: any): void {
        this.selectedHeaderFile = event.target.files[0] ?? null;

        if (this.selectedHeaderFile) {
            const reader = new FileReader();
            reader.onload = () => this.headerSrc = reader.result as string;
            reader.readAsDataURL(this.selectedHeaderFile);
        }
    }

    onCopyVerification(): void {
        this.clipboard.copy(this.verification);
        this.messageService.showSuccess('Verification code has been copied into clipboard.');
    }

    async resentConfirmationEmail(): Promise<void> {
        try {
            const resendEmailConfirmation = new ResendEmailConfirmation();
            resendEmailConfirmation.redirectBaseUrl = this.windowService.getApplicationUrl();

            await this.accountService.resend(resendEmailConfirmation);
            this.messageService.showSuccess('The email has been sent and should arrive in your inbox shortly.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    openChangePasswordDialog(): void {
        this.dialog.open(ChangePasswordDialog);
    }

    openChangeEmailDialog(): void {
        const dialogRef = this.dialog.open(ChangeEmailDialog);
        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserData();
        });
    }

    openDeleteAccountDialog(): void {
        const dialogRef = this.dialog.open(DeleteAccountDialog, {
            data: this.user
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed && this.user.userName) {
                await this.usersService.delete(this.user.userName);
                await this.authorizationService.signOut();
                await this.router.navigate(['/']);
            }
        });
    }

    openEnableTwoFactorTokenDialog(): void {
        const dialogRef = this.dialog.open(EnableTwoFactorTokenDialog, {
            data: this.user
        });

        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserData();
        });
    }

    openDisableTwoFactorTokenDialog(): void {
        const dialogRef = this.dialog.open(DisableTwoFactorTokenDialog, {
            data: this.user
        });

        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserData();
        });
    }

    openCreateAccountDialog(): void {
        const dialogRef = this.dialog.open(CreateAliasDialog, {
            data: this.user
        });

        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserAliases();
        });
    }

    onUserAliasDelete(userAlias: UserAlias): void {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete user account alias?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.userAliasesService.delete(userAlias.id);
                    this.messageService.showSuccess('Account alias has been deleted.');
                    await this.loadUserAliases();
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    private async loadUserData(): Promise<void> {
        this.user = await this.usersService.profile(this.userName);
        this.avatarSrc = this.user.avatarUrl ?? 'assets/avatar-placeholder.svg';
        this.headerSrc = this.user.headerUrl ?? 'assets/header-placeholder.svg';
    }

    private async loadUserAliases(): Promise<void> {
        this.userAliases = await this.userAliasesService.get();
    }
}
