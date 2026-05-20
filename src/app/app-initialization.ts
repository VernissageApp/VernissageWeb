import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from './services/http/settings.service';
import { CustomScriptsService } from './services/common/custom-scripts.service';
import { CustomStylesService } from './services/common/custom-styles.service';
import { LanguageService } from './services/common/language.service';

export function appInitialization(
    authorizationService: AuthorizationService,
    instanceService: InstanceService,
    settingsService: SettingsService,
    customScriptsService: CustomScriptsService,
    customStylesService: CustomStylesService,
    languageService: LanguageService
): any {
    return async () => {
        try {
            await languageService.initializeLanguage();
            await authorizationService.refreshAccessToken();

            await Promise.all([
                instanceService.load(),
                settingsService.load()
            ]);

            customScriptsService.injectScripts();
            customStylesService.injectStyles();
        } catch (error) {
            console.error(error);
            // Suppress error to let global handler navigate to exception page.
        }
    };
}
