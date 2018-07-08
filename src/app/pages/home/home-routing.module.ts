import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageResolverGuard } from '../../guards/homepage-resolver/homepage-resolver.guard';
import { HomeComponent } from './home.component';

const routes: Routes = [{
  path: '',
  component: HomeComponent,
  resolve: {
    homepage: HomepageResolverGuard
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
