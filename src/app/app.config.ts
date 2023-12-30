import {
  ApplicationConfig,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { ContentEffects } from './stores/contents/content.effect';
import {
  contentFeatureKey,
  contentReducer,
} from './stores/contents/content.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRouter(routes),
    provideStore({
      [contentFeatureKey]: contentReducer,
    }),
    provideEffects([
      ContentEffects,
    ]),
  ],
};
