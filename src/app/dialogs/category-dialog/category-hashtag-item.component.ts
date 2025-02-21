import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { ControlContainer, NgForm } from "@angular/forms";
import { CategoryHashtag } from "src/app/models/category-hashtag";

@Component({
    selector: 'app-category-hashtag-item',
    templateUrl: 'category-hashtag-item.component.html',
    styleUrls: ['category-hashtag-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    standalone: false
})
export class CategoryHashtagItemComponent {
    public hashtag = input.required<CategoryHashtag>();
    public index = input.required<number>();
    public delete = output<CategoryHashtag>();

    protected onHashtagNameChange(name: string): void {
        this.hashtag().hashtag = name;
    }

    protected onDelete(): void {
        console.log('onDelete()');
        this.delete.emit(this.hashtag());
    }
}
