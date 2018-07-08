import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HomepageContent } from '../../models/homepage-content';
import { HomepageService } from '../../services/homepage/homepage.service';

@Injectable({
  providedIn: 'root'
})
export class HomepageResolverGuard implements Resolve<HomepageContent> {
  constructor(private homepageService: HomepageService) { }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HomepageContent> {
    return this.homepageService.getHomepage();
  }
}
