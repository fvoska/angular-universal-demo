import { Injectable } from '@angular/core';
import { ExposedEnvironmentVariable } from '../../../environments/exposed-environment-variables';
import { IDictionary } from '../../interfaces/dictionary.interface';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentVariablesService {
  private vars: IDictionary<string> = {
    [ExposedEnvironmentVariable.API_BASE]: 'http://localhost:4201',
  };

  public getVar(name: ExposedEnvironmentVariable): string {
    return this.vars[name];
  }
}
