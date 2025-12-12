import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
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
import { WindowService } from 'src/app/services/common/window.service';
import { FlexiField } from 'src/app/models/flexi-field';
import { ResendEmailConfirmation } from 'src/app/models/resend-email-confirmation';
import { ChangePasswordDialog } from 'src/app/dialogs/change-password-dialog/change-password.dialog';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Clipboard } from '@angular/cdk/clipboard';
import { EnableTwoFactorTokenDialog } from 'src/app/dialogs/enable-two-factor-token/enable-two-factor-token.dialog';
import { DisableTwoFactorTokenDialog } from 'src/app/dialogs/disable-two-factor-token/disable-two-factor-token.dialog';
import { CreateAliasDialog } from 'src/app/dialogs/create-alias-dialog/create-alias.dialog';
import { UserAlias } from 'src/app/models/user-alias';
import { UserAliasesService } from 'src/app/services/http/user-aliases.service';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { ArchivesService } from 'src/app/services/http/archives.service';
import { Archive } from 'src/app/models/archive';
import { ArchiveStatus } from 'src/app/models/archive-status';
import { ExportsService } from 'src/app/services/http/exports.service';
import { FileSaverService } from 'ngx-filesaver';
import { FollowingImportsService } from 'src/app/services/http/following-imports.service';
import { PagedResult } from 'src/app/models/paged-result';
import { FollowingImport } from 'src/app/models/following-import';
import { PageEvent } from '@angular/material/paginator';
import { FollowingImportStatus } from 'src/app/models/following-import-status';
import { FollowingImportAccountsDialog } from 'src/app/dialogs/following-import-accounts-dialog/following-import-accounts.dialog';
import { FileSizeService } from 'src/app/services/common/file-size.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.page.html',
    styleUrls: ['./account.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AccountPage extends ResponsiveComponent implements OnInit {
    protected readonly archiveStatus = ArchiveStatus;
    protected readonly followingImportStatus = FollowingImportStatus;

    protected verification = signal('');
    protected user = model<User>(new User());
    protected isReady = signal(false);
    protected isSupporterFlagEnabled = model(false);

    protected aliasDisplayedColumns = signal<string[]>(['alias', 'actions']);
    protected archivesDisplayedColumns = signal<string[]>([]);
    protected followingImportsDisplayedColumns = signal<string[]>([]);

    protected userAliases = signal<UserAlias[]>([]);
    protected archives = signal<Archive[]>([]);
    protected followingImports = signal<PagedResult<FollowingImport> | undefined>(undefined);
    protected followingImportsPageIndex = signal(0);
    protected followingImportsPageSize = signal(10);
    protected maxPictureFileSizeString = signal('');
    protected maxImportFileSizeString = signal('');

    protected avatarSrc = signal('assets/avatar-placeholder.svg');
    protected headerSrc = signal('assets/header-placeholder.svg');

    private selectedAvatarFile: any = null;
    private selectedHeaderFile: any = null;
    
    private readonly defaultPictureMaxFileSize = 2097152;
    private readonly defaultImportMaxFileSize = 10485760;
    private userName = '';
    private readonly archivesDisplayedColumnsFull: string[] = ['requestDate', 'startDate', 'endDate', 'status', 'download'];
    private readonly archivesDisplayedColumnsMinimum: string[] = ['requestDate', 'download'];
    private readonly followingImportsDisplayedColumnsFull: string[] = ['createdAt', 'startedAt', 'endedAt', 'status', 'action'];
    private readonly followingImportsDisplayedColumnsMinimum: string[] = ['createdAt', 'status', 'action'];

    private usersService = inject(UsersService);
    private avatarsService = inject(AvatarsService);
    private headersService = inject(HeadersService);
    private accountService = inject(AccountService);
    private authorizationService = inject(AuthorizationService);
    private userAliasesService = inject(UserAliasesService);
    private messageService = inject(MessagesService);
    private windowService = inject(WindowService);
    private archivesService = inject(ArchivesService);
    private exportsService = inject(ExportsService);
    private fileSaverService = inject(FileSaverService);
    private followingImportsService = inject(FollowingImportsService);
    private fileSizeService = inject(FileSizeService);
    private router = inject(Router);
    private dialog = inject(MatDialog);
    private clipboard = inject(Clipboard);
    private loadingService = inject(LoadingService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.maxPictureFileSizeString.set(this.fileSizeService.getHumanFileSize(this.defaultPictureMaxFileSize, 0));
        this.maxImportFileSizeString.set(this.fileSizeService.getHumanFileSize(this.defaultImportMaxFileSize, 0));

        try {
            this.loadingService.showLoader();

            const userFromToken = this.authorizationService.getUser();
            if (userFromToken?.userName) {
                this.userName = userFromToken?.userName;
                await this.loadUserData();
                await this.loadUserAliases();
                await this.loadArchives();
                await this.loadFollowingImports();
            } else {
                this.messageService.showError('Cannot read username from token.');
            }

            const applicationBaseUrl = this.windowService.getApplicationBaseUrl()
            this.verification.set(`<a rel="me" href="${applicationBaseUrl}/@${this.user().userName}">Vernissage</a>`);
        } catch {
            this.messageService.showError('Error during downloading account data.');
            await this.router.navigate(['/home']);
        } finally {
            this.isReady.set(true);
            this.loadingService.hideLoader();
        }
    }

    protected override onHandsetPortrait(): void {
        this.archivesDisplayedColumns?.set(this.archivesDisplayedColumnsMinimum);
        this.followingImportsDisplayedColumns?.set(this.followingImportsDisplayedColumnsMinimum);
    }

    protected override onHandsetLandscape(): void {
        this.archivesDisplayedColumns?.set(this.archivesDisplayedColumnsMinimum);
        this.followingImportsDisplayedColumns?.set(this.followingImportsDisplayedColumnsMinimum);
    }

    protected override onTablet(): void {
        this.archivesDisplayedColumns?.set(this.archivesDisplayedColumnsMinimum);
        this.followingImportsDisplayedColumns?.set(this.followingImportsDisplayedColumnsMinimum);
    }

    protected override onBrowser(): void {
        this.archivesDisplayedColumns?.set(this.archivesDisplayedColumnsFull);
        this.followingImportsDisplayedColumns?.set(this.followingImportsDisplayedColumnsFull);
    }

    protected async onSubmit(): Promise<void> {
        try {
            const userInternal = this.user();

            if (userInternal.userName != null) {
                await this.usersService.update(userInternal.userName, userInternal);
                await this.authorizationService.refreshAccessToken();

                this.messageService.showSuccess('Account details have been successfully saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onAvatarFormSubmit(): Promise<void> {
        try {
            if (this.selectedAvatarFile) {
                const formData = new FormData();
                formData.append('file', this.selectedAvatarFile);

                await this.avatarsService.uploadAvatar(this.userName, formData);
                await this.loadUserData();
                this.messageService.showSuccess('Avatar has been saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onRemoveAvatar(): Promise<void> {
        try {
            const userInternal = this.user();

            if (userInternal.avatarUrl) {
                await this.avatarsService.deleteAvatar(this.userName);
                await this.loadUserData()
                this.messageService.showSuccess('Avatar has been deleted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onHeaderFormSubmit(): Promise<void> {
        try {
            if (this.selectedHeaderFile) {
                const formData = new FormData();
                formData.append('file', this.selectedHeaderFile);

                await this.headersService.uploadHeader(this.userName, formData);
                await this.loadUserData();
                this.messageService.showSuccess('Header has been saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onRemoveHeader(): Promise<void> {
        try {
            const userInternal = this.user();

            if (userInternal.headerUrl) {
                await this.headersService.deleteHeader(this.userName);
                await this.loadUserData();
                this.messageService.showSuccess('Header has been deleted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected onAddField(): void {
        this.user().fields?.push(new FlexiField())
    }

    protected onDeleteField(flexiField: FlexiField): void {
        this.user.update((userInternal) => {
            const index = userInternal.fields?.indexOf(flexiField);
            if (index != undefined) {
                userInternal.fields?.splice(index, 1);
            }

            return userInternal;
        });
    }

    protected onAvatarSelected(event: any): void {
        this.selectedAvatarFile = event.target.files[0] ?? null;

        if (this.selectedAvatarFile) {
            const reader = new FileReader();
            reader.onload = () => this.avatarSrc.set(reader.result as string);
            reader.readAsDataURL(this.selectedAvatarFile);
        }
    }

    protected onHeaderSelected(event: any): void {
        this.selectedHeaderFile = event.target.files[0] ?? null;

        if (this.selectedHeaderFile) {
            const reader = new FileReader();
            reader.onload = () => this.headerSrc.set(reader.result as string);
            reader.readAsDataURL(this.selectedHeaderFile);
        }
    }

    protected onCopyVerification(): void {
        this.clipboard.copy(this.verification());
        this.messageService.showSuccess('Verification code has been copied into clipboard.');
    }

    protected async resentConfirmationEmail(): Promise<void> {
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

    protected openChangePasswordDialog(): void {
        this.dialog.open(ChangePasswordDialog);
    }

    protected openChangeEmailDialog(): void {
        const dialogRef = this.dialog.open(ChangeEmailDialog);
        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserData();
        });
    }

    protected openDeleteAccountDialog(): void {
        const dialogRef = this.dialog.open(DeleteAccountDialog, {
            data: this.user()
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            const userInternal = this.user();

            if (result?.confirmed && userInternal.userName) {
                await this.usersService.delete(userInternal.userName);
                await this.authorizationService.signOut();
                await this.router.navigate(['/']);
            }
        });
    }

    protected openEnableTwoFactorTokenDialog(): void {
        const dialogRef = this.dialog.open(EnableTwoFactorTokenDialog);

        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserData();
        });
    }

    protected openDisableTwoFactorTokenDialog(): void {
        const dialogRef = this.dialog.open(DisableTwoFactorTokenDialog);

        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserData();
        });
    }

    protected openCreateAccountDialog(): void {
        const dialogRef = this.dialog.open(CreateAliasDialog, {
            data: this.user()
        });

        dialogRef.afterClosed().subscribe(async () => {
            await this.loadUserAliases();
        });
    }

    protected onUserAliasDelete(userAlias: UserAlias): void {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete user account alias?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.userAliasesService.delete(userAlias.id);
                    await this.loadUserAliases();

                    this.messageService.showSuccess('Account alias has been deleted.');
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected async onRequestArchive(): Promise<void> {
        try {
            await this.archivesService.create();
            await this.loadArchives();

            this.messageService.showSuccess('Archive has been requested.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onDownloadFollowing(): Promise<void> {
        const blob = await this.exportsService.following();
        this.fileSaverService.save(blob, 'following.csv');
    }

    protected async onDownloadBookmarks(): Promise<void> {
        const blob = await this.exportsService.bookmarks();
        this.fileSaverService.save(blob, 'bookmarks.csv');
    }

    protected showRequestArchiveButton(): boolean {
        const archivesInternal = this.archives();

        if (archivesInternal.length === 0) {
            return true;
        }

        if (archivesInternal.some(x => x.status === ArchiveStatus.New || x.status === ArchiveStatus.Processing)) {
            return false;
        }

        const readyArchives = archivesInternal.filter(x => x.status === ArchiveStatus.Ready);
        if (readyArchives?.length > 0) {
            const readyArchive = readyArchives[0];
            if (readyArchive && readyArchive.requestDate) {
                const requestDate = new Date(readyArchive.requestDate);
                requestDate.setMonth(requestDate.getMonth() + 1);

                const currentDate = new Date();
                if (requestDate > currentDate) {
                    return false;
                }
            }
        }

        return true;
    }

    protected async handleFollowingImportsPageEvent(pageEvent: PageEvent): Promise<void> {
        this.followingImportsPageIndex.set(pageEvent.pageIndex);
        this.followingImportsPageSize.set(pageEvent.pageSize);

        this.loadFollowingImports();
    }

    protected async onFileSelected(event: any): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (!input.files) {
            return;
        }

        const file = input.files[0];
        if (file.size > this.defaultImportMaxFileSize) {
            this.messageService.showError(`Uploaded file is too large. Maximum size is ${this.maxImportFileSizeString()}.`);
            return;
        }

        try {
            this.loadingService.showLoader();

            const formData = new FormData();
            formData.append('file', file);
            await this.followingImportsService.upload(formData);
            await this.loadFollowingImports();
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.loadingService.hideLoader();
            input.value = '';
        }
    }

    protected openShowAccountsDialog(followingImport: FollowingImport): void {
        this.dialog.open(FollowingImportAccountsDialog, {
            width: '900px',
            data: followingImport
        });
    }

    protected async onIsSupporterFlagChange(): Promise<void> {
        try {
            if (!this.isSupporterFlagEnabled()) {
                await this.accountService.disableSupporterFlag();
                this.messageService.showSuccess('Supporter flag has been disabled.');
            } else {
                await this.accountService.enableSupporterFlag();
                this.messageService.showSuccess('Supporter flag has been enabled.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private async loadUserData(): Promise<void> {
        const downloadedUser = await this.usersService.profile(this.userName);

        this.user.set(downloadedUser);
        this.avatarSrc.set(this.user().avatarUrl ?? 'assets/avatar-placeholder.svg');
        this.headerSrc.set(this.user().headerUrl ?? 'assets/header-placeholder.svg');
        this.isSupporterFlagEnabled.set(downloadedUser.isSupporterFlagEnabled);
    }

    private async loadUserAliases(): Promise<void> {
        const downloadedAliases = await this.userAliasesService.get();
        this.userAliases.set(downloadedAliases);
    }

    private async loadArchives(): Promise<void> {
        const downloadedArchives = await this.archivesService.get();
        this.archives.set(downloadedArchives);
    }

    private async loadFollowingImports(): Promise<void> {
        const downloadedFollowingImports = await this.followingImportsService.get(this.followingImportsPageIndex() + 1, this.followingImportsPageSize());
        this.followingImports.set(downloadedFollowingImports);
    }
}
