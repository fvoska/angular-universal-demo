import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.token) {
      return this.authService.checkIfUserIsLoggedIn().pipe(
        catchError(() => {
          return observableOf(false);
        }),
        map((user: User) => {
          return Boolean(user);
        })
      );
    }

    return false;
  }
}
