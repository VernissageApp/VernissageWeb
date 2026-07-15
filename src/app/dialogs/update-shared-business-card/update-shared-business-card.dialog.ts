import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { SharedBusinessCardUpdateRequest } from 'src/app/models/shared-business-card-update-request';
import { WindowService } from 'src/app/services/common/window.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-update-shared-business-card-dialog',
    templateUrl: 'update-shared-business-card.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class UpdateSharedBusinessCardDialog implements OnInit {
    protected name = model('');
    protected email = model('');
    
    private windowService = inject(WindowService);
    private dialogRef = inject(MatDialogRef<UpdateSharedBusinessCardDialog>);
    private data?: SharedBusinessCard = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.name.set(this.data?.thirdPartyName ?? '');
        this.email.set(this.data?.thirdPartyEmail ?? '');
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const sharedBusinessCardUpdateRequest = new SharedBusinessCardUpdateRequest();
        sharedBusinessCardUpdateRequest.thirdPartyName = this.name();
        sharedBusinessCardUpdateRequest.thirdPartyEmail = this.email();
        sharedBusinessCardUpdateRequest.sharedCardUrl = this.windowService.getApplicationBaseUrl() + '/cards/' + this.data?.code + '?update=true'

        this.dialogRef.close(sharedBusinessCardUpdateRequest);
    }
}
