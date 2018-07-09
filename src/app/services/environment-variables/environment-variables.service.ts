import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  defaultEnvironmentVariablesValues,
  ExposedEnvironmentVariable,
  exposedEnvironmentVariables
} from '../../../environments/exposed-environment-variables';
import { IDictionary } from '../../interfaces/dictionary.interface';
import { PlatformService } from '../platform/platform.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentVariablesService {
  private readonly transferKey = makeStateKey('envVars');
  private vars: IDictionary<string> = {};

  constructor(
    private platform: PlatformService,
    private transferState: TransferState,
  ) {
    if (this.platform.isServer) {
      exposedEnvironmentVariables.forEach((envVarName) => {
        this.vars[envVarName] = process.env[envVarName];
      });

      this.transferState.set(this.transferKey, this.vars);
    }

    if (this.platform.isBrowser) {
      this.vars = this.transferState.get(this.transferKey, {});
    }
  }

  public getVar(name: ExposedEnvironmentVariable): string {
    if (name in this.vars) {
      return this.vars[name];
    }

    const defaultValue = defaultEnvironmentVariablesValues[name];
    console.warn(`Using default value for ${name}: ${defaultValue}`);

    return defaultValue;
  }
}
