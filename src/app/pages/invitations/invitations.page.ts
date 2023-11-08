import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { InstanceService } from 'src/app/services/http/instance.service';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Invitation } from 'src/app/models/invitation';
import { InvitationsService } from 'src/app/services/http/invitations.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.page.html',
    styleUrls: ['./invitations.page.scss'],
    animations: fadeInAnimation
})
export class InvitationsPage implements OnInit {
    isReady = false;
    invitations?: Invitation[];

    displayedColumns: string[] = ['code', 'createdAt', 'invited', 'actions'];

    constructor(
        private instanceService: InstanceService,
        private invitationsService: InvitationsService,
        private messageService: MessagesService,
        private loadingService: LoadingService,
        private clipboard: Clipboard) {
    }

    async ngOnInit(): Promise<void> {
        if (!this.isRegistrationByInvitationsOpened()) {
            throw new ForbiddenError();
        }

        this.loadingService.showLoader();
        this.invitations = await this.invitationsService.get();
        this.isReady = true;
        this.loadingService.hideLoader();
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
