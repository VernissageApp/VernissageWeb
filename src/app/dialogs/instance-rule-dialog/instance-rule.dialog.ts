import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rule } from 'src/app/models/rule';
import { MessagesService } from 'src/app/services/common/messages.service';
import { RulesService } from 'src/app/services/http/rules.service';

@Component({
    selector: 'app-instance-rule-dialog',
    templateUrl: 'instance-rule.dialog.html',
    styleUrls: ['instance-rule.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InstanceRuleDialog implements OnInit {
    protected order = model(0);
    protected text = model('');

    private messageService = inject(MessagesService);
    private rulesService = inject(RulesService);
    private dialogRef = inject(MatDialogRef<InstanceRuleDialog>);
    private data?: Rule = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        if (this.data) {
            this.order.set(this.data.order);
            this.text.set(this.data.text ?? '');
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.order = this.order();
                this.data.text = this.text();

                await this.rulesService.update(this.data?.id, this.data);
                this.messageService.showSuccess('Rule has been updated.');
            } else {
                const newRule = new Rule();
                newRule.order = this.order();
                newRule.text = this.text();

                await this.rulesService.create(newRule);
                this.messageService.showSuccess('New rule has been created.');
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}