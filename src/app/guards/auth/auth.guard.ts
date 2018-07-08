import { Inject, Injectable, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { PlatformService } from '../../services/platform/platform.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private platform: PlatformService,
    @Optional() @Inject(RESPONSE) private response: Response,
  ) { }

  public canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.token) {
      return this.authService.checkIfUserIsLoggedIn().pipe(
        catchError(() => {
          this.setResponseStatus();

          return observableOf(false);
        }),
        map(() => {
          return Boolean(true);
        })
      );
    } else {
      this.setResponseStatus();
    }

    return true;
  }

  private setResponseStatus(): void {
    if (this.platform.isServer && this.response) {
      this.response.status(401);
    }
  }
}
