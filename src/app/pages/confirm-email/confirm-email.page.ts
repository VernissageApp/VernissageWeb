import { Component, computed, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ConfirmEmail } from 'src/app/models/confirm-email';
import { ConfirmEmailMode } from 'src/app/models/confirm-email-mode';
import { RegisterService } from 'src/app/services/http/register.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { isPlatformBrowser } from '@angular/common';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-confirm-email',
    templateUrl: './confirm-email.page.html',
    styleUrls: ['./confirm-email.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class ConfirmEmailPage implements OnInit {
    protected isLoggedIn = signal(false);

    protected isValidatingMode = computed(() => this.confirmEmailMode() === ConfirmEmailMode.Validating);
    protected isErrorMode = computed(() => this.confirmEmailMode() === ConfirmEmailMode.Error);
    protected isSuccessMode = computed(() => this.confirmEmailMode() === ConfirmEmailMode.Success);

    private confirmEmailMode = signal(ConfirmEmailMode.Validating);
    private isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private authorizationService: AuthorizationService,
        private route: ActivatedRoute,
        private registerService: RegisterService) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    async ngOnInit(): Promise<void> {
        this.route.queryParams.subscribe(async (params) => {
            if (!this.isBrowser) {
                return;
            }

            const isLoggedInInternal = await this.authorizationService.isLoggedIn();
            this.isLoggedIn.set(isLoggedInInternal);

            const confirmEmail = new ConfirmEmail(params.user, params.token);
            try {
                await this.registerService.confirm(confirmEmail);
                this.confirmEmailMode.set(ConfirmEmailMode.Success);
            } catch {
                this.confirmEmailMode.set(ConfirmEmailMode.Error);
            }
        });
    }
}
