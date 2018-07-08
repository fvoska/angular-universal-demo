import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  public get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public get isServer(): boolean {
    return isPlatformServer(this.platformId);
  }
}
