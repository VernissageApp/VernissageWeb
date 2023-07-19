import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { InstanceService } from 'src/app/services/http/instance.service';

export function appInitialization(
    authorizationService: AuthorizationService,
    instanceService: InstanceService
): any {
    return async () => {
        try {
            await authorizationService.refreshAccessToken();
            await instanceService.load();
        } catch (error) {
            console.error(error);
            // Suppress error to let global handler navigate to exception page.
        }
    };
}
