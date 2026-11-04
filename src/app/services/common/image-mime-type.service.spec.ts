/// <reference types="node" />
import { Blob as NodeBlob } from 'node:buffer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ImageMimeTypeService } from './image-mime-type.service';

function fileWithHeader(header: number[], type: string): Blob {
    return new NodeBlob([new Uint8Array(header)], { type }) as unknown as Blob;
}

const formats = [
    { mime: 'image/jpeg', header: [0xff, 0xd8, 0xff, 0xe0] },
    { mime: 'image/png', header: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { mime: 'image/webp', header: [0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0, 0x57, 0x45, 0x42, 0x50] }
];

describe('image MIME fallback for C2PA', () => {
    let service: ImageMimeTypeService;

    beforeEach(() => {
        service = TestBed.inject(ImageMimeTypeService);
    });

    for (const { mime, header } of formats) {
        it.each(['', 'application/octet-stream', 'image/jpg', 'text/plain'])('recognizes ' + mime + ' when MIME is %s', async type => {
            const file = fileWithHeader(header, type);
            const slice = vi.spyOn(file, 'slice');
            expect(await service.resolveImageMimeType(file)).toBe(mime);
            expect(slice).toHaveBeenCalledWith(0, 12);
            expect(file.type).toBe(type);
        });

        it('preserves ' + mime + ' without reading the file', async () => {
            const file = fileWithHeader([], mime);
            const slice = vi.spyOn(file, 'slice');
            expect(await service.resolveImageMimeType(file)).toBe(mime);
            expect(slice).not.toHaveBeenCalled();
        });
    }

    it.each([
        [],
        [0xff, 0xd8],
        [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a],
        [0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0, 0x57, 0x45, 0x42],
        [0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0, 0x41, 0x56, 0x49, 0x20],
        [0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e]
    ])('keeps the original MIME for unrecognized or truncated data: %j', async (...header) => {
        expect(await service.resolveImageMimeType(fileWithHeader(header, 'application/octet-stream'))).toBe('application/octet-stream');
    });

    it('does not infer JPEG from the filename alone', async () => {
        const file = fileWithHeader([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e], 'application/octet-stream');
        Object.defineProperty(file, 'name', { value: 'photo.jpg' });
        expect(await service.resolveImageMimeType(file)).toBe('application/octet-stream');
    });
});
