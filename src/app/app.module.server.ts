import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { WindowService } from './services/common/window.service';
import { SsrCookieService } from './services/common/ssr-cookie.service';

const jwtOptionsFactory = (cookieService: SsrCookieService, windowService: WindowService) => {
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
        JwtModule.forRoot({
            jwtOptionsProvider: {
                provide: JWT_OPTIONS,
                useFactory: jwtOptionsFactory,
                deps: [SsrCookieService, WindowService],
            }
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppServerModule {}
