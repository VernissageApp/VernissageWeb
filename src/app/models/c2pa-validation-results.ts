import { C2paValidationStatus } from './c2pa-validation-status';

export interface C2paValidationResults {
    activeManifest?: {
        failure?: C2paValidationStatus[];
    } | null;
    ingredientDeltas?: {
        validationDeltas: {
            failure?: C2paValidationStatus[];
        };
    }[] | null;
}
