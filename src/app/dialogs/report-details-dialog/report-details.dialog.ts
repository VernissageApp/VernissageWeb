import { Component, Inject, OnInit } from '@angular/core';
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
        public dialogRef: MatDialogRef<ReportDetailsDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: Report) {
    }

    ngOnInit(): void {
        this.rules = this.instanceService.instance?.rules ?? [];
        this.comment = this.data?.comment ?? '';
        this.forward = this.data?.forward ?? false;
        this.category = this.data?.category ?? '';
        this.ruleIds = this.data?.ruleIds?.map(x => +x) ?? [];
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}