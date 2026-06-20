import { describe, expect, it } from 'vitest';

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
