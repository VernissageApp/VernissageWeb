import { ChangeDetectionStrategy, Component, Inject, model } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Category } from 'src/app/models/category';
import { CategoryHashtag } from 'src/app/models/category-hashtag';
import { MessagesService } from 'src/app/services/common/messages.service';
import { CategoriesService } from 'src/app/services/http/categories.service';

@Component({
    selector: 'app-category-dialog',
    templateUrl: 'category.dialog.html',
    styleUrls: ['category.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CategoryDialog {
    protected name = model('');
    protected priority = model('');

    constructor(
        private messageService: MessagesService,
        private categoriesService: CategoriesService,
        public dialogRef: MatDialogRef<CategoryDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: Category) {
            if (this.data) {
                this.name.set(this.data.name);
                this.priority.set(this.data.priority.toString());
            }
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected onHashtagDelete(hashtag: CategoryHashtag): void {
        console.log(hashtag);
        const index = this.data?.hashtags?.indexOf(hashtag);
        console.log(index);

        if (index !== undefined && index !== null && index >= 0) {
            this.data?.hashtags?.splice(index, 1);
        }
    }

    protected onNewHashtag(): void {
        this.data?.hashtags?.push(new CategoryHashtag());
    }

    protected async onSubmit(): Promise<void> {
        try {
            if (this.data?.id) {
                this.data.name = this.name();
                this.data.priority = +this.priority();

                await this.categoriesService.update(this.data?.id, this.data);
                this.messageService.showSuccess('Category has been updated.');
            } else {
                const newCategory = new Category();
                newCategory.name = this.name();
                newCategory.priority = +this.priority();

                await this.categoriesService.create(newCategory);
                this.messageService.showSuccess('New category has been created.');
            }

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}