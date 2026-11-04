/// <reference types="node" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { C2paService } from './c2pa.service';
import { ImageMimeTypeService } from './image-mime-type.service';
import { C2paManifestStore } from 'src/app/models/c2pa-manifest-store';
import { Blob as NodeBlob } from 'node:buffer';

const createC2pa = vi.fn();

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.resetAllMocks();
});

// Exercise presence detection separately from the validation used by status details.
describe('C2PA upload detection', () => {
    function createService(reader: unknown): any {
        const service = Object.create(C2paService.prototype) as any;
        service.imageMimeTypeService = new ImageMimeTypeService();
        service.platformId = 'browser';
        service.getC2paInstance = vi.fn().mockResolvedValue({ reader: { fromBlob: vi.fn().mockResolvedValue(reader) } });
        return service;
    }

    it('detects credentials without requiring a valid or trusted manifest', async () => {
        const reader = { free: vi.fn().mockResolvedValue(undefined) };
        const service = createService(reader);
        const file = new Blob(['image']);
        expect(await service.hasContentCredentials(file, 'image/jpeg')).toBe(true);
        const sdk = await service.getC2paInstance();
        expect(sdk.reader.fromBlob).toHaveBeenCalledWith('image/jpeg', file, {
            verify: { verifyAfterReading: false, verifyTrust: false }
        });
        expect(reader.free).toHaveBeenCalledOnce();
    });

    it('returns false for an image without a manifest', async () => {
        expect(await createService(null).hasContentCredentials(new Blob([], { type: 'image/jpeg' }))).toBe(false);
    });

    it.each(['', 'application/octet-stream', 'image/jpg'])('reads C2PA using the JPEG signature when upload MIME is %s', async type => {
        const file = new NodeBlob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type }) as unknown as Blob;
        const reader = { free: vi.fn() };
        const service = createService(reader);
        expect(await service.hasContentCredentials(file)).toBe(true);
        const sdk = await service.getC2paInstance();
        expect(sdk.reader.fromBlob).toHaveBeenCalledWith('image/jpeg', file, {
            verify: { verifyAfterReading: false, verifyTrust: false }
        });
    });

    it('does not enable preservation when reading fails', async () => {
        const service = createService(null);
        service.getC2paInstance.mockRejectedValue(new Error('Unreadable image'));
        expect(await service.hasContentCredentials(new Blob())).toBe(false);
    });
});

describe('C2PA initialization', () => {
    function createService(): any {
        const service = Object.create(C2paService.prototype) as any;
        service.imageMimeTypeService = new ImageMimeTypeService();
        service.platformId = 'browser';
        service.initializationTimeoutMs = 15000;
        service.loadC2paSdk = createC2pa;
        return service;
    }

    it('shares initialization between concurrent callers', async () => {
        const sdk = { dispose: vi.fn() };
        createC2pa.mockResolvedValue(sdk);
        const service = createService();
        expect(await Promise.all([service.getC2paInstance(), service.getC2paInstance()])).toEqual([sdk, sdk]);
        expect(createC2pa).toHaveBeenCalledOnce();
    });

    it('allows initialization to be retried after a worker error', async () => {
        createC2pa.mockRejectedValueOnce(new Error('Worker blocked'));
        const service = createService();
        expect(await service.hasContentCredentials(new Blob())).toBe(false);
        const sdk = { dispose: vi.fn() };
        createC2pa.mockResolvedValueOnce(sdk);
        expect(await service.getC2paInstance()).toBe(sdk);
        expect(createC2pa).toHaveBeenCalledTimes(2);
    });

    it('lets upload continue when the worker never responds, and disposes a late SDK', async () => {
        vi.useFakeTimers();
        let resolveInitialization!: (sdk: any) => void;
        createC2pa.mockReturnValueOnce(new Promise(resolve => { resolveInitialization = resolve; }));
        const service = createService();
        const detection = service.hasContentCredentials(new Blob());
        await vi.advanceTimersByTimeAsync(15000);
        expect(await detection).toBe(false);
        expect(service.c2paPromise).toBeUndefined();
        const sdk = { dispose: vi.fn() };
        resolveInitialization(sdk);
        await vi.advanceTimersByTimeAsync(0);
        expect(sdk.dispose).toHaveBeenCalledOnce();
    });
});

describe('C2PA verification', () => {
    async function readCredentials(overrides: Partial<C2paManifestStore>, blob = new Blob(['image'], { type: 'image/jpeg' }), expectedMime = blob.type): Promise<any> {
        const service = Object.create(C2paService.prototype) as any;
        service.imageMimeTypeService = new ImageMimeTypeService();
        service.aiGeneratedTextMarkers = [];
        const store: C2paManifestStore = {
            active_manifest: 'test',
            manifests: { test: {} },
            validation_state: 'Valid',
            ...overrides
        };
        const reader = { manifestStore: async () => store, free: vi.fn() };
        const fromBlob = vi.fn().mockResolvedValue(reader);
        service.getC2paInstance = async () => ({ reader: { fromBlob } });
        vi.stubGlobal('fetch', async () => ({ ok: true, blob: async () => blob }));
        const result = await service.readContentCredentials('https://example.test/photo.jpg');
        expect(fromBlob).toHaveBeenCalledWith(expectedMime, blob);
        expect(reader.free).toHaveBeenCalledOnce();
        return result;
    }

    it.each([['Valid', 'untrusted'], ['Trusted', 'verified']])('classifies SDK validation state %s as %s', async (validation_state, expected) => {
        expect((await readCredentials({ validation_state })).verificationStatus).toBe(expected);
    });

    it('shows C2PA for a downloaded JPEG served as application/octet-stream', async () => {
        const file = new NodeBlob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type: 'application/octet-stream' }) as unknown as Blob;
        expect((await readCredentials({}, file, 'image/jpeg')).verificationStatus).toBe('untrusted');
    });

    it.each(['Invalid', undefined, null, 'unknown'])('does not claim verification for state %s', async validation_state => {
        expect((await readCredentials({ validation_state })).verificationStatus).toBe(validation_state === 'Invalid' ? 'invalid' : 'unknown');
    });

    it('marks as invalid: a data hash mismatch reported in active manifest failures without success=false', async () => {
        expect((await readCredentials({
            validation_results: { activeManifest: { failure: [{ code: 'assertion.dataHash.mismatch' }] } }
        })).verificationStatus).toBe('invalid');
    });

    it('accepts a Valid manifest with untrusted certificates in both the active manifest and ingredients', async () => {
        // Reproduces the SDK response for a valid Sony image edited in Capture One.
        const untrusted = { code: 'signingCredential.untrusted' };
        const result = await readCredentials({
            validation_state: 'Valid',
            validation_status: [untrusted, untrusted],
            validation_results: {
                activeManifest: { failure: [untrusted] },
                ingredientDeltas: [{ validationDeltas: { failure: [untrusted] } }]
            }
        });
        expect(result).toBeDefined();
        expect(result.validationState).toBe('Valid');
        expect(result.verificationStatus).toBe('untrusted');
        expect(result.validationErrors).toEqual([]);
    });

    it('marks as invalid: a hash mismatch even when untrusted certificates are also reported', async () => {
        expect((await readCredentials({
            validation_results: {
                activeManifest: { failure: [
                    { code: 'signingCredential.untrusted' },
                    { code: 'assertion.dataHash.mismatch' }
                ] }
            }
        })).verificationStatus).toBe('invalid');
    });

    it('marks as invalid: failure results stored on the manifest', async () => {
        expect((await readCredentials({
            manifests: { test: { validation_results: { activeManifest: { failure: [{ code: 'claimSignature.mismatch' }] } } } }
        })).verificationStatus).toBe('invalid');
    });

    it('marks as invalid: ingredient validation failures', async () => {
        expect((await readCredentials({
            validation_results: { ingredientDeltas: [{ validationDeltas: { failure: [{ code: 'assertion.dataHash.mismatch' }] } }] }
        })).verificationStatus).toBe('invalid');
    });

    it('marks as invalid: explicit legacy validation failures', async () => {
        expect((await readCredentials({ validation_status: [{ code: 'assertion.dataHash.mismatch', success: false }] })).verificationStatus).toBe('invalid');
    });

    it('keeps failure details and deduplicates repeated errors for the dialog', async () => {
        const failure = { code: 'claimSignature.mismatch', explanation: 'Signature mismatch' };
        const result = await readCredentials({
            validation_state: 'Invalid',
            validation_status: [{ ...failure, success: false }],
            validation_results: { activeManifest: { failure: [failure] } }
        });
        expect(result.verificationStatus).toBe('invalid');
        expect(result.validationErrors).toEqual([{ ...failure, success: false }]);
    });

    it('does not show a panel when the file has no active C2PA manifest', async () => {
        expect(await readCredentials({ active_manifest: undefined, manifests: {} })).toBeUndefined();
    });
});
