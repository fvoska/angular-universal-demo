import { Component } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from '../../../../node_modules/rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public email: string;
  public password: string;

  constructor(public authService: AuthService) { }

  public onLogInClick(): void {
    this.authService.logIn({
      email: this.email,
      password: this.password
    })
    .pipe(catchError(() => {
      alert('Invalid credentials');
      return EMPTY;
    }))
    .subscribe();
  }

  public onLogOutClick(): void {
    this.authService.logOut();
  }
}
