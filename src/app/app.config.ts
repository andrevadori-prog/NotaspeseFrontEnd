import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import it from '@angular/common/locales/it';
import { provideRouter } from '@angular/router';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { it_IT, provideNzI18n } from 'ng-zorro-antd/i18n';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PruningTranslationLoader } from './core/providers/pruning-translation-loader';
import { MchAuthenticationV2LibModule } from 'mch-authentication-v2-lib';
import { environment } from '../environments/environment';

import { routes } from './app.routes';

export function HttpLoaderFactory(
  http: HttpClient
): PruningTranslationLoader {
  return new PruningTranslationLoader(http, './assets/i18n/', '.json');
}
registerLocaleData(it);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    importProvidersFrom(
      TranslateModule.forRoot({
        useDefaultLang: true,
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      MchAuthenticationV2LibModule.forRoot({
        apiBaseUrl: environment.apiUrl,
        tokenKey: 'nota-spese-access-token',
        loginUrl: '/home',
        redirectUrl: '/expenses/reports'
      })
    ),

    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideNzI18n(it_IT),
    { provide: LOCALE_ID, useValue: 'it-IT' }
  ]
};