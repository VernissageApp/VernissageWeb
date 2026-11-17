import { C2paManifest } from './c2pa-manifest';
import { C2paValidationStatus } from './c2pa-validation-status';
import { C2paValidationResults } from './c2pa-validation-results';

export interface C2paManifestStore {
    active_manifest?: string;
    manifests?: Record<string, C2paManifest>;
    validation_status?: C2paValidationStatus[] | null;
    validation_state?: string | null;
    validation_results?: C2paValidationResults | null;
}
