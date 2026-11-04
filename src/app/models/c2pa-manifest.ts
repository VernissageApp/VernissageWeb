import { C2paAssertion } from './c2pa-assertion';
import { C2paClaimGeneratorInfo } from './c2pa-claim-generator-info';
import { C2paIngredient } from './c2pa-ingredient';
import { C2paSignatureInfo } from './c2pa-signature-info';
import { C2paValidationStatus } from './c2pa-validation-status';
import { C2paValidationResults } from './c2pa-validation-results';

export interface C2paManifest {
    title?: string;
    format?: string;
    claim_generator?: string;
    claim_generator_info?: C2paClaimGeneratorInfo[];
    signature_info?: C2paSignatureInfo;
    ingredients?: C2paIngredient[];
    assertions?: C2paAssertion[];
    validation_status?: C2paValidationStatus[];
    validation_results?: C2paValidationResults | null;
}
