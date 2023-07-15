import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AttachmentsService } from 'src/app/services/http/attachments.service';
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

    selectedPhotoFile: any = null;
    photoSrc?: string;

    constructor(private messageService: MessagesService, private attachmentsService: AttachmentsService) {
    }

    ngOnInit(): void {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
        );
    }

    async onPhotoSelected(event: any): Promise<void> {
        this.selectedPhotoFile = event.target.files[0] ?? null;

        if (this.selectedPhotoFile) {
            const reader = new FileReader();
            reader.onload = () => this.photoSrc = reader.result as string;
            reader.readAsDataURL(this.selectedPhotoFile);

            try {
                const formData = new FormData();
                formData.append('file', this.selectedPhotoFile);
                await this.attachmentsService.uploadAttachment(formData);
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    async onPhotoFormSubmit(): Promise<void> {
        try {
            if (this.selectedPhotoFile) {
                const formData = new FormData();
                formData.append('file', this.selectedPhotoFile);

                await this.attachmentsService.uploadAttachment(formData);
                this.messageService.showSuccess('Photo has ben uploaded.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
}
