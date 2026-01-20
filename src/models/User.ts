import sql from 'mssql'

// Configuración de la base de datos
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'master',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

// Definición de la interfaz para el usuario
export interface User {
  userId: number
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  passwordHash: string
  role: string
  enabledUser: boolean
  companyId?: number
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
  isHR: boolean
}

// Clase para gestionar operaciones de usuario en la base de datos
export class UserModel {
  // Método para encontrar un usuario por su email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const pool = new sql.ConnectionPool(config)
      await pool.connect()
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query(`
          SELECT * FROM Users 
          WHERE Email = @email
        `)

      await pool.close()

      if (result.recordset.length === 0) {
        return null
      }

      // Mapear el resultado a nuestra interfaz User
      const user = result.recordset[0]
      return {
        userId: user.UserId,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        username: user.Username,
        password: user.Password,
        passwordHash: user.PasswordHash,
        role: user.Role,
        enabledUser: user.EnabledUser,
        companyId: user.CompanyId,
        twoFactorEnabled: user.TwoFactorEnabled,
        createdAt: user.CreatedAt,
        updatedAt: user.UpdatedAt,
        isHR: user.IsHR
      }
    } catch (error) {
      console.error('Error al buscar usuario por email:', error)
      return null
    }
  }

  // Método para encontrar un usuario por su ID
  static async findById(id: string | number): Promise<User | null> {
    try {
      const pool = await sql.connect(config)
      const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
          SELECT * FROM Users 
          WHERE UserId = @id
        `)

      if (result.recordset.length === 0) {
        return null
      }

      // Mapear el resultado a nuestra interfaz User
      const user = result.recordset[0]
      return {
        userId: user.UserId,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        username: user.Username,
        password: user.Password,
        passwordHash: user.PasswordHash,
        role: user.Role,
        enabledUser: user.EnabledUser,
        companyId: user.CompanyId,
        twoFactorEnabled: user.TwoFactorEnabled,
        createdAt: user.CreatedAt,
        updatedAt: user.UpdatedAt,
        isHR: user.IsHR,
        // Campos requeridos por BetterAuthUser
        id: user.UserId.toString(),
        hashedPassword: user.PasswordHash
      }
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error)
      return null
    }
  }

  // Método para crear un nuevo usuario
  static async create(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt' | 'id' | 'hashedPassword'>): Promise<User | null> {
    try {
      const pool = await sql.connect(config)
      const result = await pool.request()
        .input('firstName', sql.NVarChar, userData.firstName)
        .input('lastName', sql.NVarChar, userData.lastName)
        .input('email', sql.NVarChar, userData.email)
        .input('username', sql.NVarChar, userData.username)
        .input('password', sql.NVarChar, userData.password)
        .input('passwordHash', sql.NVarChar, userData.passwordHash)
        .input('role', sql.NVarChar, userData.role)
        .input('enabledUser', sql.Bit, userData.enabledUser)
        .input('companyId', sql.BigInt, userData.companyId)
        .input('twoFactorEnabled', sql.Bit, userData.twoFactorEnabled)
        .input('isHR', sql.Bit, userData.isHR)
        .query(`
          INSERT INTO Users (
            FirstName, LastName, Email, Username, 
            Password, PasswordHash, Role, EnabledUser, 
            CompanyId, TwoFactorEnabled, IsHR
          )
          OUTPUT INSERTED.*
          VALUES (
            @firstName, @lastName, @email, @username,
            @password, @passwordHash, @role, @enabledUser,
            @companyId, @twoFactorEnabled, @isHR
          )
        `)

      if (result.recordset.length === 0) {
        return null
      }

      // Mapear el resultado a nuestra interfaz User
      const user = result.recordset[0]
      return {
        userId: user.UserId,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        username: user.Username,
        password: user.Password,
        passwordHash: user.PasswordHash,
        role: user.Role,
        enabledUser: user.EnabledUser,
        companyId: user.CompanyId,
        twoFactorEnabled: user.TwoFactorEnabled,
        createdAt: user.CreatedAt,
        updatedAt: user.UpdatedAt,
        isHR: user.IsHR,
        // Campos requeridos por BetterAuthUser
        id: user.UserId.toString(),
        hashedPassword: user.PasswordHash
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return null
    }
  }

  // Método para actualizar un usuario existente
  static async update(id: number, userData: Partial<User>): Promise<boolean> {
    try {
      const pool = await sql.connect(config)
      
      // Construir la consulta dinámicamente basada en los campos proporcionados
      let query = 'UPDATE Users SET '
      const inputs: any[] = []
      const params: any = {}
      
      if (userData.firstName !== undefined) {
        inputs.push('FirstName = @firstName')
        params.firstName = userData.firstName
      }
      
      if (userData.lastName !== undefined) {
        inputs.push('LastName = @lastName')
        params.lastName = userData.lastName
      }
      
      if (userData.email !== undefined) {
        inputs.push('Email = @email')
        params.email = userData.email
      }
      
      if (userData.username !== undefined) {
        inputs.push('Username = @username')
        params.username = userData.username
      }
      
      if (userData.password !== undefined) {
        inputs.push('Password = @password')
        params.password = userData.password
      }
      
      if (userData.passwordHash !== undefined) {
        inputs.push('PasswordHash = @passwordHash')
        params.passwordHash = userData.passwordHash
      }
      
      if (userData.role !== undefined) {
        inputs.push('Role = @role')
        params.role = userData.role
      }
      
      if (userData.enabledUser !== undefined) {
        inputs.push('EnabledUser = @enabledUser')
        params.enabledUser = userData.enabledUser
      }
      
      if (userData.companyId !== undefined) {
        inputs.push('CompanyId = @companyId')
        params.companyId = userData.companyId
      }
      
      if (userData.twoFactorEnabled !== undefined) {
        inputs.push('TwoFactorEnabled = @twoFactorEnabled')
        params.twoFactorEnabled = userData.twoFactorEnabled
      }
      
      if (userData.isHR !== undefined) {
        inputs.push('IsHR = @isHR')
        params.isHR = userData.isHR
      }
      
      // Siempre actualizar la fecha de actualización
      inputs.push('UpdatedAt = GETDATE()')
      
      // Si no hay campos para actualizar, retornar true
      if (inputs.length === 0) {
        return true
      }
      
      query += inputs.join(', ')
      query += ' WHERE UserId = @id'
      
      const request = pool.request()
      request.input('id', sql.BigInt, id)
      
      // Agregar todos los parámetros a la consulta
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value)
      }
      
      await request.query(query)
      return true
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return false
    }
  }
}