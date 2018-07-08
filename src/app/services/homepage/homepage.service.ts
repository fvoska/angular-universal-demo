import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, of as observableOf } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ExposedEnvironmentVariable } from '../../../environments/exposed-environment-variables';
import { IHomepageContent } from '../../interfaces/homepage-content.interface';
import { HomepageContent } from '../../models/homepage-content';
import { EnvironmentVariablesService } from '../environment-variables/environment-variables.service';
import { PlatformService } from '../platform/platform.service';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  private apiBase: string = this.env.getVar(ExposedEnvironmentVariable.API_BASE);
  private readonly hompeageStateKey = makeStateKey<IHomepageContent>('homepageData');

  constructor(
    private env: EnvironmentVariablesService,
    private http: HttpClient,
    private platform: PlatformService,
    private transferState: TransferState,
  ) { }

  public getHomepage(): Observable<HomepageContent> {
    const transferedHomepageData: IHomepageContent = this.transferState.get(this.hompeageStateKey, null);
    if (this.platform.isBrowser && transferedHomepageData) {
      this.transferState.remove(this.hompeageStateKey);

      const homepage = new HomepageContent(transferedHomepageData);

      return observableOf(homepage);
    }

    return this.http.get(`${this.apiBase}/homepage`).pipe(
      tap((homepageData: IHomepageContent) => {
        if (this.platform.isServer) {
          this.transferState.set(this.hompeageStateKey, homepageData);
        }
      }),
      map((homepageData: IHomepageContent) => {
        return new HomepageContent(homepageData);
      }),
    );
  }
}
