import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReportRequest } from 'src/app/models/report-request';
import { Rule } from 'src/app/models/rule';
import { InstanceService } from 'src/app/services/http/instance.service';
import { ReportData } from './report-data';

@Component({
    selector: 'app-report-dialog',
    templateUrl: 'report.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
