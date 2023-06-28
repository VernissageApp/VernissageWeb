import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';

import { environment } from 'src/environments/environment';
// import { NgxCaptchaModule } from 'ngx-captcha';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { PersistanceService } from './services/persistance/persistance.service';
import { AuthorizationService } from './services/authorization/authorization.service';
import { PagesModule } from './pages/pages.module';
import { APIInterceptor } from './interceptors/api.interceptor';

const jwtOptionsFactory = (persistanceService: PersistanceService) => {
  return {
    tokenGetter: () => persistanceService.getAccessToken(),
    allowedDomains: [environment.usersService]
  };
};

const appInitialization = (authorizationService: AuthorizationService) => () => authorizationService.refreshAccessToken();
const httpInterceptor = (router: Router) => new APIInterceptor(router);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [PersistanceService]
      }
    }),
    // NgxCaptchaModule,
    PagesModule
  ],
  providers: [
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'check' } },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitialization,
      deps: [AuthorizationService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: httpInterceptor,
      deps: [Router],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
