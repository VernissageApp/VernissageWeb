import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { InstanceRuleDialog } from 'src/app/dialogs/instance-rule-dialog/instance-rule.dialog';
import { PaginableResult } from 'src/app/models/paginable-result';
import { Rule } from 'src/app/models/rule';
import { MessagesService } from 'src/app/services/common/messages.service';
import { RulesService } from 'src/app/services/http/rules.service';

@Component({
    selector: 'app-instance-rules',
    templateUrl: './instance-rules.component.html',
    styleUrls: ['./instance-rules.component.scss'],
    standalone: false
})
export class InstanceRulesComponent extends ResponsiveComponent implements OnInit {
    protected rules = signal<PaginableResult<Rule> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);
    protected pageIndex = signal(0);
    
    private pageSize = 10;
    private readonly displayedColumnsHandsetPortrait: string[] = ['text', 'actions'];
    private readonly displayedColumnsHandserLandscape: string[] = ['text', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['order', 'text', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['order', 'text', 'actions'];

    constructor(
        private rulesService: RulesService,
        private messageService: MessagesService,
        public dialog: MatDialog,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const downloadedRules = await this.rulesService.get(this.pageIndex() + 1, this.pageSize);
        this.rules.set(downloadedRules);
    }

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        this.pageIndex.set(pageEvent.pageIndex);
        this.pageSize = pageEvent.pageSize;

        const downloadedRules = await this.rulesService.get(this.pageIndex() + 1, this.pageSize);
        this.rules.set(downloadedRules);
    }

    protected async onDelete(rule: Rule): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete instance rule?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.rulesService.delete(rule.id);
                    this.messageService.showSuccess('Rule has been deleted.');

                    const downloadedRules = await this.rulesService.get(this.pageIndex() + 1, this.pageSize);
                    this.rules.set(downloadedRules);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected openRuleDialog(rule: Rule | undefined): void {
        const dialogRef = this.dialog.open(InstanceRuleDialog, {
            width: '500px',
            data: (rule ?? new Rule())
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                const downloadedRules = await this.rulesService.get(this.pageIndex() + 1, this.pageSize);
                this.rules.set(downloadedRules);
            }
        });
    }

    protected override onHandsetPortrait(): void {
        this.displayedColumns?.set(this.displayedColumnsHandsetPortrait);
    }

    protected override onHandsetLandscape(): void {
        this.displayedColumns?.set(this.displayedColumnsHandserLandscape);
    }

    protected override onTablet(): void {
        this.displayedColumns?.set(this.displayedColumnsTablet);
    }

    protected override onBrowser(): void {
        this.displayedColumns?.set(this.displayedColumnsBrowser);
    }
}
