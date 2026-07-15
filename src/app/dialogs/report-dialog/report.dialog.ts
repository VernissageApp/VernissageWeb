import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ReportRequest } from 'src/app/models/report-request';
import { Rule } from 'src/app/models/rule';
import { InstanceService } from 'src/app/services/http/instance.service';
import { ReportData } from './report-data';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-report-dialog',
    templateUrl: 'report.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, CdkTextareaAutosize, MaxLengthValidatorDirective, MatError, MatSelect, MatOption, MatCheckbox, MatDialogActions, MatButton, TranslatePipe]
})
export class ReportDialog implements OnInit {
    protected comment = model('');
    protected forward = model(false);
    protected category = model('');
    protected ruleIds = model<number[]>([]);

    protected isLocal = signal(false);
    protected rules = signal<Rule[]>([]);

    protected categories = signal([
        "Abusive",
        "Copyright",
        "Impersonation",
        "Scam",
        "Sensitive",
        "Spam",
        "Terrorism",
        "Underage",
        "Violence"
    ]);

    private instanceService = inject(InstanceService);
    private dialogRef = inject(MatDialogRef<ReportDialog>);
    private data?: ReportData = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.rules.set(this.instanceService.instance?.rules ?? []);
        this.isLocal.set(this.data?.user?.isLocal ?? false);
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const reportRequest = new ReportRequest();
        reportRequest.reportedUserId = this.data?.user?.id;
        reportRequest.statusId = this.data?.status?.id;
        reportRequest.category = this.category();
        reportRequest.comment = this.comment();
        reportRequest.forward = this.forward();
        reportRequest.ruleIds = this.ruleIds();

        this.dialogRef.close(reportRequest);
    }
}
