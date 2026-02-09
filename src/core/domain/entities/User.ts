import { Email } from '../value-objects/Email';
import { UserStatus } from '../enums/UserStatus';

export interface IUser {
  id: bigint;
  email: Email;
  password: string; // Hasheado
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  public readonly id: bigint;
  public email: Email;
  public password: string;
  public status: UserStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>) {
    this.id = BigInt(0); // Será asignado por la base de datos
    this.email = data.email;
    this.password = data.password;
    this.status = data.status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data: {
    email: string;
    password: string;
  }): User {
    const email = Email.create(data.email);
    const status = UserStatus.ACTIVE;

    return new User({
      email,
      password: data.password,
      status
    });
  }

  updateEmail(email: string): void {
    this.email = Email.create(email);
    this.updatedAt = new Date();
  }

  updateStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  toJSON(): Omit<IUser, 'password'> {
    return {
      id: this.id,
      email: this.email,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}