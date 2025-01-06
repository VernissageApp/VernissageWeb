import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { InstanceService } from 'src/app/services/http/instance.service';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Invitation } from 'src/app/models/invitation';
import { InvitationsService } from 'src/app/services/http/invitations.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SettingsService } from 'src/app/services/http/settings.service';
import { PublicSettings } from 'src/app/models/public-settings';

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.page.html',
    styleUrls: ['./invitations.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InvitationsPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);
    protected invitations = signal<Invitation[] | undefined>(undefined);
    protected publicSettings = signal<PublicSettings | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);
    protected canGenerateNewInvitations = computed(() => (this.invitations?.length ?? 0) < (this.publicSettings()?.maximumNumberOfInvitations ?? 0));

    private readonly displayedColumnsHandsetPortrait: string[] = ['code', 'actions'];
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

        const [invitationsInternal, publicSettingsInternal] = await Promise.all([
            this.invitationsService.get(),
            this.settingsService.getPublic()
        ]);

        this.invitations.set(invitationsInternal);
        this.publicSettings.set(publicSettingsInternal);

        this.isReady.set(true);
        this.loadingService.hideLoader();
    }

    protected override onHandsetPortrait(): void {
        this.displayedColumns?.set(this.displayedColumnsHandsetPortrait);
    }

    protected override onHandsetLandscape(): void {
        this.displayedColumns?.set(this.displayedColumnsHandserLandscape);
    }

    protected override onTablet(): void {
        this.displayedColumns?.set(this.displayedColumnsTablet);
    }

    protected override onBrowser(): void {
        this.displayedColumns?.set(this.displayedColumnsBrowser);
    }

    protected async generate(): Promise<void> {
        try {
            await this.invitationsService.generate();
            const downloadedInvitations = await this.invitationsService.get();
            this.invitations.set(downloadedInvitations);
            this.messageService.showSuccess('Invitation code has been generated.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async delete(id: string): Promise<void> {
        try {
            await this.invitationsService.delete(id);
            const downloadedInvitations = await this.invitationsService.get();
            this.invitations.set(downloadedInvitations);
            this.messageService.showSuccess('Invitation code has been deleted.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected copy(code: string): void {
        this.clipboard.copy(code);
        this.messageService.showSuccess('Code has been copied into clipboard.');
    }

    private isRegistrationByInvitationsOpened(): boolean {
        return this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true;
    }
}
