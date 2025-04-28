import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { SharedBusinessCardUpdateRequest } from 'src/app/models/shared-business-card-update-request';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-update-shared-business-card-dialog',
    templateUrl: 'update-shared-business-card.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
