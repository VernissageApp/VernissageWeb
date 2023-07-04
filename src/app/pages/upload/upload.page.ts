import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-upload',
    templateUrl: './upload.page.html',
    styleUrls: ['./upload.page.scss'],
    animations: fadeInAnimation
})
export class UploadPage implements OnInit {
    statusText = '';
    altText = '';
    commentsDisabled = false;
    isSensitive = false;
    contentWarning = '';

    myControl = new FormControl('');
    options: string[] = ['Wrocław', 'Legnica', 'London'];
    filteredOptions?: Observable<string[]>;

    ngOnInit(): void {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
        );
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
}
