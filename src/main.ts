import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  // Bootstrap after SSR content is loaded (required for TransferState functionality)
  platformBrowserDynamic().bootstrapModule(AppModule).catch((err: any) => {
    console.log(err);
  });
});
