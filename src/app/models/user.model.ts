import { IUser } from '../interfaces/user.interface';

export class User implements IUser {
  public id: string;
  public email: string;

  constructor(userData: IUser) {
    this.id = userData.id;
    this.email = userData.email;
  }
}
