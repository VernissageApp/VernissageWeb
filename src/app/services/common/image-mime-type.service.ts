import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageMimeTypeService {
    /** Resolve generic or unsupported MIME types using only the image header. */
    public async resolveImageMimeType(file: Blob, mimeType = file.type): Promise<string> {
        if (mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/webp') {
            return mimeType;
        }

        const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
        const matches = (signature: number[], offset = 0): boolean =>
            signature.every((byte, index) => header[offset + index] === byte);

        if (matches([0xff, 0xd8, 0xff])) {
            return 'image/jpeg';
        }
        if (matches([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
            return 'image/png';
        }
        if (matches([0x52, 0x49, 0x46, 0x46]) && matches([0x57, 0x45, 0x42, 0x50], 8)) {
            return 'image/webp';
        }

        // Keep the existing SDK behavior for unknown data and other formats.
        return mimeType;
    }
}
