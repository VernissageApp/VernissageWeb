import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { ControlContainer, NgForm, FormsModule } from "@angular/forms";
import { CategoryHashtag } from "src/app/models/category-hashtag";
import { MatFormField, MatLabel, MatError, MatSuffix } from "@angular/material/form-field";
import { InputActivityDirective } from "../../directives/input-activity.directive";
import { MatInput } from "@angular/material/input";
import { MaxLengthValidatorDirective } from "../../validators/directives/max-length-validator.directive";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
    selector: 'app-category-hashtag-item',
    templateUrl: 'category-hashtag-item.component.html',
    styleUrls: ['category-hashtag-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    imports: [MatFormField, MatLabel, InputActivityDirective, MatInput, FormsModule, MaxLengthValidatorDirective, MatError, MatIconButton, MatSuffix, MatIcon, TranslatePipe]
})
export class CategoryHashtagItemComponent {
    public hashtag = input.required<CategoryHashtag>();
    public index = input.required<number>();
    public delete = output<CategoryHashtag>();

    protected onHashtagNameChange(name: string): void {
        this.hashtag().hashtag = name;
    }

    protected onDelete(): void {
        this.delete.emit(this.hashtag());
    }
}
