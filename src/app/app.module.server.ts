import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { CookieBackendModule } from 'ngx-cookie-backend';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie';
import { WindowService } from './services/common/window.service';

const jwtOptionsFactory = (cookieService: CookieService, windowService: WindowService) => {
    return {
        tokenGetter: () => {
            return cookieService.get('access-token');
        },
        allowedDomains: [windowService.apiService(), 'localhost']
    };
};

@NgModule({
    imports: [
        AppModule,
        ServerModule,
        CookieBackendModule.withOptions(),
        JwtModule.forRoot({
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                useFactory: jwtOptionsFactory,
                deps: [CookieService, WindowService],
            }
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppServerModule {}
