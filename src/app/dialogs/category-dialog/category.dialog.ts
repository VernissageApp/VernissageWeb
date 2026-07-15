import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Category } from 'src/app/models/category';
import { CategoryHashtag } from 'src/app/models/category-hashtag';
import { MessagesService } from 'src/app/services/common/messages.service';
import { CategoriesService } from 'src/app/services/http/categories.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatDivider } from '@angular/material/list';
import { CategoryHashtagItemComponent } from './category-hashtag-item.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-category-dialog',
    templateUrl: 'category.dialog.html',
    styleUrls: ['category.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, MatDivider, CategoryHashtagItemComponent, MatButton, MatDialogActions, TranslatePipe]
})
export class CategoryDialog implements OnInit {
    protected name = model('');
    protected priority = model('');
    protected hashtags = signal<CategoryHashtag[]>([]);

    private messageService = inject(MessagesService);
    private categoriesService = inject(CategoriesService);
    private dialogRef = inject(MatDialogRef<CategoryDialog>);
    private data?: Category = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);

    public ngOnInit(): void {
        if (this.data) {
            this.name.set(this.data.name);
            this.priority.set(this.data.priority.toString());

            this.hashtags.update((value) => {
                return [...value, ...this.data?.hashtags ?? []];
            });
        }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected onHashtagDelete(hashtag: CategoryHashtag): void {
        this.hashtags.update((value) => {
            const index = value.indexOf(hashtag);

            if (index !== undefined && index !== null && index >= 0) {
                value.splice(index, 1);
            }

            return [...value];
        });
    }

    protected onNewHashtag(): void {
        this.hashtags.update((value) => {
            return [...value, new CategoryHashtag()];
        });
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.name = this.name();
                this.data.priority = +this.priority();
                this.data.hashtags = this.hashtags();

                await this.categoriesService.update(this.data?.id, this.data);
                this.messageService.showSuccess(this.translateService.instant('dialogs.category.messages.categoryHasBeenUpdated'));
            } else {
                const newCategory = new Category();
                newCategory.name = this.name();
                newCategory.priority = +this.priority();
                newCategory.hashtags = this.hashtags();

                await this.categoriesService.create(newCategory);
                this.messageService.showSuccess(this.translateService.instant('dialogs.category.messages.newCategoryHasBeenCreated'));
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
