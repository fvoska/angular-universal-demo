import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccessDeniedComponent } from './access-denied.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [AccessDeniedComponent],
  exports: [AccessDeniedComponent],
})
export class AccessDeniedModule { }
