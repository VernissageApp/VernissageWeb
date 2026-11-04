import { C2paValidationStatus } from './c2pa-validation-status';

export interface C2paContentCredentials {
    author?: string;
    appOrDeviceUsed?: string;
    aiGenerated: boolean;
    identity?: string;
    actions?: string;
    title?: string;
    format?: string;
    claimGenerator?: string;
    softwareAgent?: string;
    signatureIssuer?: string;
    signatureTime?: string;
    ingredientsCount: number;
    actionsCount: number;
    validationStatuses: C2paValidationStatus[];
    verificationStatus: 'verified' | 'untrusted' | 'invalid' | 'unknown';
    validationErrors: C2paValidationStatus[];
    validationState?: string;
    verifyUrl: string;
    manifest: unknown;
}
