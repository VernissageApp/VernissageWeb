import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReportRequest } from 'src/app/models/report-request';
import { Rule } from 'src/app/models/rule';
import { InstanceService } from 'src/app/services/http/instance.service';
import { ReportData } from './report-data';

@Component({
    selector: 'app-report-dialog',
    templateUrl: 'report.dialog.html',
    standalone: false
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
        @Inject(MAT_DIALOG_DATA) public data?: ReportData) {
    }

    ngOnInit(): void {
        this.rules = this.instanceService.instance?.rules ?? [];
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        const reportRequest = new ReportRequest();
        reportRequest.reportedUserId = this.data?.user?.id;
        reportRequest.statusId = this.data?.status?.id;
        reportRequest.category = this.category;
        reportRequest.comment = this.comment;
        reportRequest.forward = this.forward;
        reportRequest.ruleIds = this.ruleIds;

        this.dialogRef.close(reportRequest);
    }
}