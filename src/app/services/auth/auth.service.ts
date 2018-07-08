import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, of as observableOf, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ExposedEnvironmentVariable } from '../../../environments/exposed-environment-variables';
import { ILoginResponse } from '../../interfaces/login-response.interface';
import { IUser } from '../../interfaces/user.interface';
import { User } from '../../models/user.model';
import { CookieService } from '../cookie/cookie.service';
import { EnvironmentVariablesService } from '../environment-variables/environment-variables.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: User;
  private _token: string;
  private readonly authCookieName: string = 'token';
  private apiBase: string = this.env.getVar(ExposedEnvironmentVariable.API_BASE);

  constructor(
    private http: HttpClient,
    private env: EnvironmentVariablesService,
    private cookie: CookieService,
    private router: Router,
  ) {
    const token = this.cookie.getCookie(this.authCookieName);
    this.token = token;
    if (this.token) {
      this.getUserInfo().pipe(catchError(() => EMPTY)).subscribe();
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

  public getUserInfo(): Observable<User> {
    return this.http.get(`${this.apiBase}/self`, {
      headers: {
        authorization: this.token
      },
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.token = null;
        return throwError(error);
      }),
      map((userData: IUser) => {
        const user = new User({
          id: userData.id,
          email: userData.email
        });

        this.user = user;

        return user;
      }),
      tap((user: User) => {
        this.user = user;
      }),
    );
  }

  public checkIfUserIsLoggedIn(): Observable<boolean> {
    return this.http.get(`${this.apiBase}/self`, {
      headers: {
        authorization: this.token,
      },
    }).pipe(
      catchError(() => {
        this.token = null;
        return observableOf(false);
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
