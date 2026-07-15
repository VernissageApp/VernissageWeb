import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Rule } from 'src/app/models/rule';
import { Report } from 'src/app/models/report';
import { InstanceService } from 'src/app/services/http/instance.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-report-details-dialog',
    templateUrl: 'report-details.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, CdkTextareaAutosize, FormsModule, MatSelect, MatOption, MatCheckbox, MatDialogActions, MatButton, TranslatePipe]
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

    private instanceService = inject(InstanceService);
    private dialogRef = inject(MatDialogRef<ReportDetailsDialog>);
    private data?: Report = inject(MAT_DIALOG_DATA);

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
