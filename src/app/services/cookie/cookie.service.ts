import { Inject, Injectable, Optional } from '@angular/core';
// import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';
import { CookieAttributes, get, getJSON, remove, set } from 'js-cookie';
import { IDictionary } from './../../interfaces/dictionary.interface';
import { PlatformService } from './../platform/platform.service';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  constructor(
    @Optional() @Inject('REQUEST') private request: Request,
    private platform: PlatformService,
  ) { }

  public setCookie(name: string, value: string, options?: CookieAttributes): void {
    if (this.platform.isBrowser) {
      set(name, value, options);
    }
  }

  public deleteCookie(name: string, options?: CookieAttributes): void {
    if (this.platform.isBrowser) {
      remove(name, options);
    }
  }

  public getCookie(name: string): string {
    if (this.platform.isBrowser) {
      return get(name);
    } else if (this.request) {
      const match = new RegExp(`${name}=([^;]*)(;|$)`).exec(this.request.headers.cookie as string);
      if (!match || !match.length || !match[1]) {
        return undefined;
      }

      return match[1];
    }
  }

  public getAll(): IDictionary<string> {
    if (this.platform.isBrowser) {
      return getJSON();
    } else if (this.request) {
      const cookies: IDictionary = {};
      let match;
      // tslint:disable-next-line:no-conditional-assignment
      while ((match = /([^;]*)=([^;]*)(;|$)/.exec(this.request.headers.cookie as string)) !== null) {
        cookies[match[1]] = match[2];
      }
    }
  }
}
