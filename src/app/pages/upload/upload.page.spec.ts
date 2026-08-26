import { HttpEventType } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { UploadPhoto } from 'src/app/models/upload-photo';
import { describe, expect, it, vi } from 'vitest';
import { UploadPage } from './upload.page';

function stripCameraModel(model: string, manufacturer: string): string {
    if (manufacturer && model.startsWith(manufacturer)) {
        model = model.replace(manufacturer, '').trim();
    }

    return model;
}

describe('stripCameraModel', () => {
    it('should remove the manufacturer from the model if it starts with the manufacturer', () => {
        const manufacturer = 'Canon';
        const model = 'Canon EOS 5D';
        const expectedResult = 'EOS 5D';

        const result = stripCameraModel(model, manufacturer);
        expect(result).toBe(expectedResult);
    });

    it('should not modify the model if it does not start with the manufacturer', () => {
        const manufacturer = 'Canon';
        const model = 'Nikon D850';
        const expectedResult = 'Nikon D850';

        const result = stripCameraModel(model, manufacturer);
        expect(result).toBe(expectedResult);
    });

    it('should return the model unchanged if manufacturer is empty', () => {
        const manufacturer = '';
        const model = 'Canon EOS 5D';
        const expectedResult = 'Canon EOS 5D';

        const result = stripCameraModel(model, manufacturer);
        expect(result).toBe(expectedResult);
    });

    it('should handle whitespace correctly when removing the manufacturer', () => {
        const manufacturer = 'Canon';
        const model = 'Canon    EOS 5D';
        const expectedResult = 'EOS 5D';

        const result = stripCameraModel(model, manufacturer);
        expect(result).toBe(expectedResult);
    });
});

describe('photo upload errors', () => {
    function createPage(uploadEvents: Observable<unknown>): any {
        const page = Object.create(UploadPage.prototype) as any;
        page.photos = signal<UploadPhoto[]>([]);
        page.hashtagsInProgress = signal(false);
        page.isEditMode = signal(false);
        page.attachmentsService = {
            uploadAttachmentWithProgress: vi.fn(() => uploadEvents),
            deleteAttachment: vi.fn()
        };
        page.messageService = {
            getServerErrorMessage: vi.fn((error: any) => error?.error?.reason ?? 'Unknown error'),
            getErrorDetails: vi.fn((error: any) => error instanceof Error ? error.message : JSON.stringify(error)),
            showError: vi.fn(),
            showServerError: vi.fn()
        };
        page.translateService = {
            instant: vi.fn((key: string) => key === 'common.messages.unknownError'
                ? 'Unknown error'
                : 'This image could not be uploaded.')
        };
        page.resetPhotoFileUpload = vi.fn();

        return page;
    }

    function createPhoto(): UploadPhoto {
        const photo = new UploadPhoto('photo-1');
        photo.photoFile = new Blob(['image'], { type: 'image/jpeg' });
        return photo;
    }

    it('stores a server upload error on the affected photo', () => {
        const error = { error: { reason: 'Storage quota exceeded.' } };
        const page = createPage(throwError(() => error));
        const photo = createPhoto();
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        page.uploadPhoto(photo);

        expect(page.photos()).toEqual([photo]);
        expect(photo.isUploading()).toBe(false);
        expect(photo.isUploaded()).toBe(false);
        expect(photo.uploadError()).toBe('Storage quota exceeded.');
        expect(photo.uploadErrorDetails()).toBe(JSON.stringify(error));
        expect(page.messageService.showError).toHaveBeenCalledWith('Storage quota exceeded.', error, JSON.stringify(error));
        consoleError.mockRestore();
    });

    it('treats a successful HTTP response without an attachment as an upload error', () => {
        const page = createPage(of({ type: HttpEventType.Response, body: null }));
        const photo = createPhoto();
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        page.uploadPhoto(photo);

        expect(photo.isUploading()).toBe(false);
        expect(photo.isUploaded()).toBe(false);
        expect(photo.uploadError()).toBe('This image could not be uploaded.');
        expect(photo.uploadErrorDetails()).toContain('attachment upload response');
        expect(page.messageService.showError).toHaveBeenCalledOnce();
        consoleError.mockRestore();
    });

    it('clears the error state after a successful upload', () => {
        const page = createPage(of({
            type: HttpEventType.Response,
            body: { id: 'attachment-1' }
        }));
        const photo = createPhoto();
        photo.uploadError.set('Previous error');
        photo.uploadErrorDetails.set('Previous details');

        page.uploadPhoto(photo);

        expect(photo.id).toBe('attachment-1');
        expect(photo.isUploading()).toBe(false);
        expect(photo.isUploaded()).toBe(true);
        expect(photo.uploadProgress()).toBe(100);
        expect(photo.uploadError()).toBeUndefined();
        expect(photo.uploadErrorDetails()).toBeUndefined();
    });

    it('allows a failed local photo to be removed without calling the delete API', async () => {
        const page = createPage(of());
        const photo = createPhoto();
        photo.uploadError.set('Upload failed');
        page.photos.set([photo]);

        await page.onPhotoDelete(photo);

        expect(page.photos()).toEqual([]);
        expect(page.attachmentsService.deleteAttachment).not.toHaveBeenCalled();
        expect(photo.isDeleting()).toBe(false);
    });
});
