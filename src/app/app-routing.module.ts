import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';

const routes: Routes = [{
  path: '',
  loadChildren: './pages/home/home.module#HomeModule',
}, {
  path: 'user-profile',
  loadChildren: './pages/user-profile/user-profile.module#UserProfileModule',
  canActivate: [AuthGuard],
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
