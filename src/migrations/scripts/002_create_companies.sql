-- Migración 002: Crear tabla de empresas
-- Fecha: 2024-07-03

-- Tabla de empresas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[companies]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[companies] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [nit] NVARCHAR(50) NOT NULL,
        [address] NVARCHAR(500) NULL,
        [phone] NVARCHAR(50) NULL,
        [email] NVARCHAR(255) NULL,
        [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME NOT NULL DEFAULT GETDATE()
    );
    
    CREATE UNIQUE INDEX [idx_companies_nit] ON [dbo].[companies] ([nit]);
    
    PRINT 'Tabla companies creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla companies ya existe';
END

-- Registrar esta migración
INSERT INTO [dbo].[migrations] ([name]) VALUES ('002_create_companies');