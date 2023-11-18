import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReportRequest } from 'src/app/models/report-request';
import { Rule } from 'src/app/models/rule';
import { User } from 'src/app/models/user';
import { InstanceService } from 'src/app/services/http/instance.service';

@Component({
    selector: 'report',
    templateUrl: 'report.dialog.html'
})
export class ReportDialog implements OnInit {
    comment = '';
    forward = false;
    category = '';
    ruleIds: number[] = [];

    categories = [
        "Abusive",
        "Copyright",
        "Impersonation",
        "Scam",
        "Sensitive",
        "Spam",
        "Terrorism",
        "Underage",
        "Violence"
    ];

    rules: Rule[] = []

    constructor(
        private instanceService: InstanceService,
        public dialogRef: MatDialogRef<ReportDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: User) {
    }

    ngOnInit(): void {
        this.rules = this.instanceService.instance?.rules ?? [];
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        const reportRequest = new ReportRequest();
        reportRequest.reportedUserId = this.data?.id;
        reportRequest.category = this.category;
        reportRequest.comment = this.comment;
        reportRequest.forward = this.forward;
        reportRequest.ruleIds = this.ruleIds;

        this.dialogRef.close(reportRequest);
    }
}