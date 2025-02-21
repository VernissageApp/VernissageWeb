import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { CategoryDialog } from 'src/app/dialogs/category-dialog/category.dialog';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { Category } from 'src/app/models/category';
import { PagedResult } from 'src/app/models/paged-result';
import { MessagesService } from 'src/app/services/common/messages.service';
import { CategoriesService } from 'src/app/services/http/categories.service';

@Component({
    selector: 'app-category-list',
    templateUrl: './category-list.component.html',
    styleUrls: ['./category-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CategoryListComponent extends ResponsiveComponent implements OnInit {
    protected categories = signal<PagedResult<Category> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);
    protected pageIndex = signal(0);

    private pageSize = 10;
    private readonly displayedColumnsHandsetPortrait: string[] = ['categoryName', 'categoryEnabled', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['categoryName', 'categoryEnabled', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['categoryName', 'categoryEnabled', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['categoryName', 'categoryEnabled', 'actions'];

    constructor(
        private categoriesService: CategoriesService,
        private messageService: MessagesService,
        public dialog: MatDialog,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const categoriesInternal = await this.categoriesService.get(this.pageIndex() + 1, this.pageSize);
        this.categories.set(categoriesInternal);
    }

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        this.pageIndex.set(pageEvent.pageIndex);
        this.pageSize = pageEvent.pageSize;

        const categoriesInternal = await this.categoriesService.get(this.pageIndex() + 1, this.pageSize);
        this.categories.set(categoriesInternal);
    }

    protected async onEnabledChange(id: string, isEnabled: boolean): Promise<void> {
        try {
            if (isEnabled) {
                await this.categoriesService.enable(id);
                this.messageService.showSuccess('Category has been enabled.');
            } else {
                await this.categoriesService.disable(id);
                this.messageService.showSuccess('Category has been disabled.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onDelete(category: Category): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete category?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.categoriesService.delete(category.id ??  '');
                    this.messageService.showSuccess('Category has been deleted.');

                    const categoriesInternal = await this.categoriesService.get(this.pageIndex() + 1, this.pageSize);
                    this.categories.set(categoriesInternal);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected openCategoryDialog(category: Category | undefined): void {
        const dialogRef = this.dialog.open(CategoryDialog, {
            width: '500px',
            data: (category ?? new Category())
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                const categoriesInternal = await this.categoriesService.get(this.pageIndex() + 1, this.pageSize);
                this.categories.set(categoriesInternal);
            }
        });
    }

    protected override onHandsetPortrait(): void {
        this.displayedColumns?.set(this.displayedColumnsHandsetPortrait);
    }

    protected override onHandsetLandscape(): void {
        this.displayedColumns?.set(this.displayedColumnsHandsetLandscape);
    }

    protected override onTablet(): void {
        this.displayedColumns?.set(this.displayedColumnsTablet);
    }

    protected override onBrowser(): void {
        this.displayedColumns?.set(this.displayedColumnsBrowser);
    }
}
