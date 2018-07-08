import { IDictionary } from '../app/interfaces/dictionary.interface';

export enum ExposedEnvironmentVariable {
  API_BASE = 'API_BASE',
}

export const exposedEnvironmentVariables: Array<string> = [
  ExposedEnvironmentVariable.API_BASE,
];

export const defaultEnvironmentVariablesValues: IDictionary<string> = {
  [ExposedEnvironmentVariable.API_BASE]: 'http://localhost:4201',
};
