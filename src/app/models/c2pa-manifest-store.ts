import { C2paManifest } from './c2pa-manifest';
import { C2paValidationStatus } from './c2pa-validation-status';

export interface C2paManifestStore {
    active_manifest?: string;
    manifests?: Record<string, C2paManifest>;
    validation_status?: C2paValidationStatus[] | null;
    validation_state?: string | null;
}
