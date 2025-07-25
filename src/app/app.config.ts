import { environment } from '../environments/environment';

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';

export function tokenGetter() {
  return sessionStorage.getItem('jwt_token');
}

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    // provideHttpClient(),
    provideAnimationsAsync(),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [new URL(environment.apiUrl).host],
          disallowedRoutes: [
            `${environment.apiUrl}/api/Auth/register`,
            `${environment.apiUrl}/api/Auth/login`,
            `${environment.apiUrl}/api/Auth/confirm-email`,
            `${environment.apiUrl}/api/Auth/forgot-password`,
            `${environment.apiUrl}/api/Auth/reset-password`,
          ],
        },
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
