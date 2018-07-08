import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';
import { EMPTY, Observable, of as observableOf, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ExposedEnvironmentVariable } from '../../../environments/exposed-environment-variables';
import { ILoginResponse } from '../../interfaces/login-response.interface';
import { IUser } from '../../interfaces/user.interface';
import { User } from '../../models/user.model';
import { CookieService } from '../cookie/cookie.service';
import { EnvironmentVariablesService } from '../environment-variables/environment-variables.service';
import { PlatformService } from '../platform/platform.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: User;
  private _token: string;
  private readonly authCookieName: string = 'token';
  private apiBase: string = this.env.getVar(ExposedEnvironmentVariable.API_BASE);
  private readonly userStateKey = makeStateKey<IUser>('userData');
  private readonly loginCheckStateKey = makeStateKey<boolean>('loginCheck');

  constructor(
    private http: HttpClient,
    private env: EnvironmentVariablesService,
    private cookie: CookieService,
    private router: Router,
    private platform: PlatformService,
    private transferState: TransferState,
    @Optional() @Inject(RESPONSE) private response: Response,
  ) {
    const token = this.cookie.getCookie(this.authCookieName);
    this.token = token;

    if (this.token) {
      this.getUserInfo(true).pipe(catchError(() => EMPTY)).subscribe();
    }
  }

  public get token(): string {
    return this._token;
  }

  public set token(token: string) {
    this._token = token;

    if (!token) {
      this.cookie.deleteCookie(this.authCookieName);
    } else {
      this.cookie.setCookie(this.authCookieName, token);
    }
  }

  public logIn({ email, password }: { email: string; password: string }): Observable<User> {
    return this.http.post(`${this.apiBase}/login`, {
      email,
      password,
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      }),
      tap((loginResponse: ILoginResponse) => {
        this.token = loginResponse.token;
      }),
      switchMap(() => {
        return this.getUserInfo();
      }),
    );
  }

  public logOut(): void {
    this.user = null;
    this.token = null;
    this.cookie.deleteCookie(this.authCookieName);
    this.router.navigateByUrl('/');
  }

  public getUserInfo(checkTransferedUser: boolean = false): Observable<User> {
    if (checkTransferedUser) {
      const transferedUserData: IUser = this.transferState.get(this.userStateKey, null);
      if (this.platform.isBrowser && transferedUserData !== undefined) {
        this.transferState.remove(this.userStateKey);

        if (!transferedUserData) {
          this.cookie.deleteCookie(this.authCookieName);

          return throwError(new Error('invalid user'));
        }

        const user = new User({
          id: transferedUserData.id,
          email: transferedUserData.email,
        });

        this.user = user;

        return observableOf(user);
      }
    }

    return this.http.get(`${this.apiBase}/user`, {
      headers: {
        authorization: this.token
      },
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.token = null;

        if (this.platform.isServer) {
          this.response.status(401);
          this.transferState.set(this.userStateKey, null);
        }

        return throwError(error);
      }),
      tap((userData: IUser) => {
        if (this.platform.isServer) {
          this.transferState.set(this.userStateKey, userData);
        }
      }),
      map((userData: IUser) => {
        const user = new User({
          id: userData.id,
          email: userData.email
        });

        return user;
      }),
      tap((user: User) => {
        this.user = user;
      }),
    );
  }

  public checkIfUserIsLoggedIn(): Observable<boolean> {
    const transferedLoginCheckData: boolean = this.transferState.get(this.loginCheckStateKey, null);
    if (this.platform.isBrowser && transferedLoginCheckData !== undefined) {
      this.transferState.remove(this.loginCheckStateKey);

      return observableOf(transferedLoginCheckData);
    }

    return this.http.get(`${this.apiBase}/login-check`, {
      headers: {
        authorization: this.token,
      },
    }).pipe(
      catchError(() => {
        this.token = null;

        if (this.platform.isServer) {
          this.transferState.set(this.loginCheckStateKey, false);
        }

        return observableOf(false);
      }),
      tap(() => {
        if (this.platform.isServer) {
          this.transferState.set(this.loginCheckStateKey, true);
        }
      }),
      map(() => {
        return true;
      }),
    );
  }

  public get isUserLoggedIn(): boolean {
    return Boolean(this.user && this.token);
  }
}
