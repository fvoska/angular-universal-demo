import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from '../../../../node_modules/rxjs';
import { map } from '../../../../node_modules/rxjs/operators';
import { ExposedEnvironmentVariable } from '../../../environments/exposed-environment-variables';
import { IHomepageContent } from '../../interfaces/homepage-content.interface';
import { HomepageContent } from '../../models/homepage-content';
import { EnvironmentVariablesService } from '../environment-variables/environment-variables.service';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  private apiBase: string = this.env.getVar(ExposedEnvironmentVariable.API_BASE);

  constructor(
    private env: EnvironmentVariablesService,
    private http: HttpClient,
  ) { }

  public getHomepage(): Observable<HomepageContent> {
    return this.http.get(`${this.apiBase}/homepage`).pipe(map((homepageData: IHomepageContent) => {
      return new HomepageContent(homepageData);
    }));
  }
}
