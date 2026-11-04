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

describe('photo drag and drop', () => {
    function createPage(): any {
        const page = Object.create(UploadPage.prototype) as any;
        page.photos = signal<UploadPhoto[]>([]);
        page.maxMediaAttachments = signal(4);
        page.isPhotoDragOver = signal(false);
        page.processSelectedPhoto = vi.fn().mockResolvedValue(undefined);
        page.resetPhotoFileUpload = vi.fn();
        page.messageService = { showError: vi.fn() };
        page.translateService = { instant: vi.fn((key: string) => key) };
        return page;
    }

    function createDragEvent(files: File[] = [], types = ['Files']): DragEvent {
        return {
            dataTransfer: { files, types, dropEffect: 'none' },
            preventDefault: vi.fn(),
            stopPropagation: vi.fn()
        } as unknown as DragEvent;
    }

    it('allows file drops and highlights the dropzone', () => {
        const page = createPage();
        const event = createDragEvent();

        page.onPhotoDragOver(event);

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(event.stopPropagation).toHaveBeenCalledOnce();
        expect(event.dataTransfer?.dropEffect).toBe('copy');
        expect(page.isPhotoDragOver()).toBe(true);
    });

    it('ignores dragged text', () => {
        const page = createPage();
        const event = createDragEvent([], ['text/plain']);

        page.onPhotoDragOver(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(page.isPhotoDragOver()).toBe(false);
    });

    it('keeps the highlight when moving over children and clears it when leaving', () => {
        const page = createPage();
        const dropzone = document.createElement('div');
        const plus = document.createElement('span');
        dropzone.appendChild(plus);
        page.isPhotoDragOver.set(true);

        page.onPhotoDragLeave({ currentTarget: dropzone, relatedTarget: plus } as unknown as DragEvent);
        expect(page.isPhotoDragOver()).toBe(true);

        page.onPhotoDragLeave({ currentTarget: dropzone, relatedTarget: null } as unknown as DragEvent);
        expect(page.isPhotoDragOver()).toBe(false);
    });

    it('processes all dropped files and prevents the browser from opening them', async () => {
        const page = createPage();
        const files = [new File(['photo'], 'photo.jpg'), new File(['photo'], 'photo.png')];
        const event = createDragEvent(files);
        page.isPhotoDragOver.set(true);

        await page.onPhotoDrop(event);

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(event.stopPropagation).toHaveBeenCalledOnce();
        expect(page.isPhotoDragOver()).toBe(false);
        expect(page.processSelectedPhoto).toHaveBeenNthCalledWith(1, files[0]);
        expect(page.processSelectedPhoto).toHaveBeenNthCalledWith(2, files[1]);
    });

    it('rejects drops exceeding the remaining attachment slots', async () => {
        const page = createPage();
        page.photos.set([new UploadPhoto('1'), new UploadPhoto('2'), new UploadPhoto('3')]);

        await page.onPhotoDrop(createDragEvent([new File(['photo'], 'photo.jpg'), new File(['photo'], 'photo.png')]));

        expect(page.processSelectedPhoto).not.toHaveBeenCalled();
        expect(page.messageService.showError).toHaveBeenCalledWith('pages.upload.messages.tooManyFilesSelectedSingular');
    });

    it('ignores drops without files', async () => {
        const page = createPage();

        await page.onPhotoDrop(createDragEvent());

        expect(page.processSelectedPhoto).not.toHaveBeenCalled();
        expect(page.messageService.showError).not.toHaveBeenCalled();
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

describe('C2PA upload consent', () => {
    function createPage(hasCredentials: boolean, consent?: boolean): any {
        const page = Object.create(UploadPage.prototype) as any;
        page.maxFileSize = 100;
        page.maxFileSizeString = signal('100 B');
        page.randomGeneratorService = { generateString: () => 'photo-1' };
        page.c2paService = { hasContentCredentials: vi.fn().mockResolvedValue(hasCredentials) };
        page.preferencesService = { alwaysAskToUploadOriginalImage: false };
        page.dialog = { open: vi.fn(() => ({ afterClosed: () => of(consent) })) };
        page.deviceDetectorService = { deviceType: () => 'mobile' };
        page.setPhotoData = vi.fn();
        page.readExifMetadataAndUpload = vi.fn();
        page.resizeImageToJpeg = vi.fn().mockResolvedValue(new Blob(['resized']));
        page.messageService = { showError: vi.fn() };
        page.translateService = { instant: (key: string) => key };
        return page;
    }

    it('uploads photos without C2PA without asking or preserving metadata', async () => {
        const page = createPage(false);
        await page.processSelectedPhoto(new File(['image'], 'photo.jpg', { type: 'image/jpeg' }));
        expect(page.dialog.open).not.toHaveBeenCalled();
        expect(page.readExifMetadataAndUpload.mock.calls[0][0].useOriginalImage).toBe(false);
    });

    it.each([true, false, undefined])('preserves the original only for explicit consent: %s', async consent => {
        const page = createPage(true, consent);
        const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
        await page.processSelectedPhoto(file);
        expect(page.dialog.open).toHaveBeenCalledOnce();
        const photo = page.readExifMetadataAndUpload.mock.calls[0][0] as UploadPhoto;
        expect(photo.useOriginalImage).toBe(consent === true);
        expect(photo.photoFile).toBe(file);
    });

    it.each([true, false, undefined])('asks for photos without C2PA when enabled and respects the decision: %s', async consent => {
        const page = createPage(false, consent);
        page.preferencesService.alwaysAskToUploadOriginalImage = true;
        const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });

        await page.processSelectedPhoto(file);

        expect(page.dialog.open).toHaveBeenCalledOnce();
        expect(page.dialog.open.mock.calls[0][1].data).toEqual({ fileName: 'photo.jpg', hasContentCredentials: false });
        const photo = page.readExifMetadataAndUpload.mock.calls[0][0] as UploadPhoto;
        expect(photo.useOriginalImage).toBe(consent === true);
        expect(photo.photoFile).toBe(file);
    });

    it('shows a single C2PA warning when the preference is also enabled', async () => {
        const page = createPage(true, true);
        page.preferencesService.alwaysAskToUploadOriginalImage = true;

        await page.processSelectedPhoto(new File(['image'], 'photo.jpg'));

        expect(page.dialog.open).toHaveBeenCalledOnce();
        expect(page.dialog.open.mock.calls[0][1].data.hasContentCredentials).toBe(true);
    });

    it('waits for consent before starting the upload', async () => {
        const page = createPage(true);
        const { Subject } = await import('rxjs');
        const decision = new Subject<boolean>();
        page.dialog.open.mockReturnValue({ afterClosed: () => decision });
        const processing = page.processSelectedPhoto(new File(['image'], 'photo.jpg'));
        await Promise.resolve();
        expect(page.readExifMetadataAndUpload).not.toHaveBeenCalled();
        decision.next(true);
        decision.complete();
        await processing;
        expect(page.readExifMetadataAndUpload).toHaveBeenCalledOnce();
    });

    it('rejects oversized originals rather than resizing away C2PA after consent', async () => {
        const page = createPage(true, true);
        await page.processSelectedPhoto(new File(['x'.repeat(101)], 'photo.jpg'));
        expect(page.resizeImageToJpeg).not.toHaveBeenCalled();
        expect(page.readExifMetadataAndUpload).not.toHaveBeenCalled();
        expect(page.messageService.showError).toHaveBeenCalledWith('pages.upload.messages.fileTooLarge');
    });

    it('still permits standard resizing after declining preservation', async () => {
        const page = createPage(true, false);
        await page.processSelectedPhoto(new File(['x'.repeat(101)], 'photo.jpg'));
        expect(page.resizeImageToJpeg).toHaveBeenCalledOnce();
        expect(page.readExifMetadataAndUpload.mock.calls[0][0].useOriginalImage).toBe(false);
    });

    it.each([true, false])('sends the preservation flag only when approved: %s', preserve => {
        const page = createPage(true, preserve);
        page.photos = signal<UploadPhoto[]>([]);
        page.resetPhotoFileUpload = vi.fn();
        page.attachmentsService = { uploadAttachmentWithProgress: vi.fn(() => of({ type: HttpEventType.Response, body: { id: 'attachment-1' } })) };
        const photo = new UploadPhoto('photo-1');
        photo.photoFile = new Blob(['original'], { type: 'image/jpeg' });
        photo.photoResizedFile = new Blob(['resized'], { type: 'image/jpeg' });
        photo.useOriginalImage = preserve;
        page.uploadPhoto(photo);
        const data = page.attachmentsService.uploadAttachmentWithProgress.mock.calls[0][0] as FormData;
        expect(data.get('useOriginalImage')).toBe(preserve ? 'true' : null);
        expect((data.get('file') as Blob).size).toBe(preserve ? photo.photoFile.size : photo.photoResizedFile.size);
    });
});
