import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from './services/http/settings.service';

export function appInitialization(
    authorizationService: AuthorizationService,
    instanceService: InstanceService,
    settingsService: SettingsService
): any {
    return async () => {
        try {
            await authorizationService.refreshAccessToken();

            await Promise.all([
                instanceService.load(),
                settingsService.load()
            ]);
        } catch (error) {
            console.error(error);
            // Suppress error to let global handler navigate to exception page.
        }
    };
}
