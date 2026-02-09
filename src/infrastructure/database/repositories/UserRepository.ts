import { User } from '../../../../core/domain/entities/User';
import { Email } from '../../../../core/domain/value-objects/Email';
import { IUserRepository } from '../../../../core/domain/contracts/IUserRepository';
import { sql } from '../../connections/mssql';
import { DomainError } from '../../../../core/shared/errors/DomainError';

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    try {
      const result = await sql`
        INSERT INTO Users (Email, Password, Status, CreatedDate, ModifiedDate)
        OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Status, INSERTED.CreatedDate, INSERTED.ModifiedDate
        VALUES (${user.email.toString()}, ${user.password}, ${user.status}, GETDATE(), GETDATE())
      `;

      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        return this.mapRowToUser(row);
      }

      throw new DomainError('Failed to create user');
    } catch (error) {
      throw new DomainError('Database error during user creation', 'DB_ERROR');
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const result = await sql`
        SELECT UserId, Email, Password, Status, CreatedDate, ModifiedDate
        FROM Users
        WHERE Email = ${email.toString()}
      `;

      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        return this.mapRowToUser(row);
      }

      return null;
    } catch (error) {
      throw new DomainError('Database error during user search', 'DB_ERROR');
    }
  }

  async findById(id: bigint): Promise<User | null> {
    try {
      const result = await sql`
        SELECT UserId, Email, Password, Status, CreatedDate, ModifiedDate
        FROM Users
        WHERE UserId = ${id}
      `;

      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        return this.mapRowToUser(row);
      }

      return null;
    } catch (error) {
      throw new DomainError('Database error during user search', 'DB_ERROR');
    }
  }

  async update(user: User): Promise<User> {
    try {
      const result = await sql`
        UPDATE Users
        SET Email = ${user.email.toString()},
            Status = ${user.status},
            ModifiedDate = GETDATE()
        OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Status, INSERTED.CreatedDate, INSERTED.ModifiedDate
        WHERE UserId = ${user.id}
      `;

      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        return this.mapRowToUser(row);
      }

      throw new DomainError('User not found for update');
    } catch (error) {
      throw new DomainError('Database error during user update', 'DB_ERROR');
    }
  }

  async delete(id: bigint): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM Users
        WHERE UserId = ${id}
      `;

      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw new DomainError('Database error during user deletion', 'DB_ERROR');
    }
  }

  private mapRowToUser(row: any): User {
    const email = Email.create(row.Email);
    
    const user = new User({
      email,
      password: row.Password,
      status: row.Status
    });

    // Asignar propiedades readonly (necesitamos hacerlo de esta forma)
    (user as any).id = BigInt(row.UserId);
    (user as any).createdAt = new Date(row.CreatedDate);
    (user as any).updatedAt = new Date(row.ModifiedDate);

    return user;
  }
}