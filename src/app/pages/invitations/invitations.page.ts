import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { InstanceService } from 'src/app/services/http/instance.service';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Invitation } from 'src/app/models/invitation';
import { InvitationsService } from 'src/app/services/http/invitations.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SettingsService } from 'src/app/services/http/settings.service';
import { PublicSettings } from 'src/app/models/public-settings';

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.page.html',
    styleUrls: ['./invitations.page.scss'],
    animations: fadeInAnimation
})
export class InvitationsPage extends Responsive {
    isReady = false;
    invitations?: Invitation[];
    publicSettings?: PublicSettings;
    displayedColumns: string[] = [];

    private readonly displayedColumnsHandsetPortrait: string[] = ['code'];
    private readonly displayedColumnsHandserLandscape: string[] = ['code', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['code', 'invited', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['code', 'createdAt', 'invited', 'actions'];
    
    constructor(
        private instanceService: InstanceService,
        private invitationsService: InvitationsService,
        private messageService: MessagesService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private clipboard: Clipboard,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        if (!this.isRegistrationByInvitationsOpened()) {
            throw new ForbiddenError();
        }

        this.loadingService.showLoader();

        [this.invitations, this.publicSettings] = await Promise.all([
            this.invitationsService.get(),
            this.settingsService.getPublic()
        ]);

        this.isReady = true;
        this.loadingService.hideLoader();
    }

    canGenerateNewInvitations(): boolean {
        return (this.invitations?.length ?? 0) < (this.publicSettings?.maximumNumberOfInvitations ?? 0);
    }

    protected override onHandsetPortrait(): void {
        this.displayedColumns = this.displayedColumnsHandsetPortrait;
    }

    protected override onHandsetLandscape(): void {
        this.displayedColumns = this.displayedColumnsHandserLandscape;
    }

    protected override onTablet(): void {
        this.displayedColumns = this.displayedColumnsTablet;
    }

    protected override onBrowser(): void {
        this.displayedColumns = this.displayedColumnsBrowser;
    }

    async generate(): Promise<void> {
        try {
            await this.invitationsService.generate();
            this.invitations = await this.invitationsService.get();
            this.messageService.showSuccess('Invitation code has been generated.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.invitationsService.delete(id);
            this.invitations = await this.invitationsService.get();
            this.messageService.showSuccess('Invitation code has been deleted.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    copy(code: string): void {
        this.clipboard.copy(code);
        this.messageService.showSuccess('Code has been copied into clipboard.');
    }

    private isRegistrationByInvitationsOpened(): boolean {
        return this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true;
    }
}
