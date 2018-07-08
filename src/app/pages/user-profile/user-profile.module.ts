import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccessDeniedModule } from '../../components/access-denied/access-denied.module';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';

@NgModule({
  imports: [
    CommonModule,
    AccessDeniedModule,
    UserProfileRoutingModule,
  ],
  declarations: [UserProfileComponent]
})
export class UserProfileModule { }
