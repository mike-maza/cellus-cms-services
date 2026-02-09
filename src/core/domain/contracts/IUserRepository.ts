import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: bigint): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: bigint): Promise<boolean>;
  
  // Métodos adicionales para queries complejos
  findActiveUsers(): Promise<User[]>;
  findUsersByStatus(status: string): Promise<User[]>;
  countUsers(): Promise<number>;
}