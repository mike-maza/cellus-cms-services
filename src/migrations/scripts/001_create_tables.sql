-- Migración 001: Crear tablas iniciales
-- Fecha: 2024-07-03

-- Tabla para registrar las migraciones ejecutadas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[migrations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[migrations] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [executed_at] DATETIME NOT NULL DEFAULT GETDATE()
    );
    
    PRINT 'Tabla migrations creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla migrations ya existe';
END

-- Tabla de usuarios
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(255) NOT NULL,
        [password] NVARCHAR(255) NOT NULL,
        [full_name] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(50) NOT NULL,
        [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME NOT NULL DEFAULT GETDATE(),
        [last_login] DATETIME NULL
    );
    
    CREATE UNIQUE INDEX [idx_users_email] ON [dbo].[users] ([email]);
    CREATE UNIQUE INDEX [idx_users_username] ON [dbo].[users] ([username]);
    
    PRINT 'Tabla users creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla users ya existe';
END

-- Registrar esta migración
INSERT INTO [dbo].[migrations] ([name]) VALUES ('001_create_tables');