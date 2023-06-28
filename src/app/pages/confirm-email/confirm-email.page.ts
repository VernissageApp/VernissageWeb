import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ConfirmEmail } from 'src/app/models/confirm-email';
import { ConfirmEmailMode } from 'src/app/models/confirm-email-mode';
import { RegisterService } from 'src/app/services/http/register.service';

@Component({
    selector: 'app-confirm-email',
    templateUrl: './confirm-email.page.html',
    styleUrls: ['./confirm-email.page.scss']
})
export class ConfirmEmailPage implements OnInit {

    confirmEmailMode = ConfirmEmailMode.Validating;

    constructor(
        private route: ActivatedRoute,
        private registerService: RegisterService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(async (params) => {
            const confirmEmail = new ConfirmEmail(params.user, params.token);
            try {
                await this.registerService.confirm(confirmEmail);
                this.confirmEmailMode = ConfirmEmailMode.Success;
            } catch {
                this.confirmEmailMode = ConfirmEmailMode.Error;
            }
        });
    }

    isValidatingMode(): boolean {
        return this.confirmEmailMode === ConfirmEmailMode.Validating;
    }

    isErrorMode(): boolean {
        return this.confirmEmailMode === ConfirmEmailMode.Error;
    }

    isSuccessMode(): boolean {
        return this.confirmEmailMode === ConfirmEmailMode.Success;
    }
}
