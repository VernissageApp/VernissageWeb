import { Component, Inject, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rule } from 'src/app/models/rule';
import { Report } from 'src/app/models/report';
import { InstanceService } from 'src/app/services/http/instance.service';

@Component({
    selector: 'app-report-details-dialog',
    templateUrl: 'report-details.dialog.html',
    standalone: false
})
export class ReportDetailsDialog implements OnInit {
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

    constructor(
        private instanceService: InstanceService,
        public dialogRef: MatDialogRef<ReportDetailsDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: Report) {
    }

    ngOnInit(): void {
        this.rules.set(this.instanceService.instance?.rules ?? []);
        this.comment.set(this.data?.comment ?? '');
        this.forward.set(this.data?.forward ?? false);
        this.category.set(this.data?.category ?? '');
        this.ruleIds.set(this.data?.ruleIds?.map(x => +x) ?? []);
        this.isLocal.set(this.data?.reportedUser?.isLocal ?? false);
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }
}