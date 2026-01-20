-- Migración 003: Crear tabla de empleados
-- Fecha: 2024-07-03

-- Tabla de empleados
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[employees]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[employees] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [code] NVARCHAR(50) NOT NULL,
        [full_name] NVARCHAR(255) NOT NULL,
        [company_id] INT NOT NULL,
        [position] NVARCHAR(100) NULL,
        [nit] NVARCHAR(50) NULL,
        [email] NVARCHAR(255) NULL,
        [phone] NVARCHAR(50) NULL,
        [hire_date] DATE NULL,
        [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_employees_companies] FOREIGN KEY ([company_id]) REFERENCES [dbo].[companies] ([id])
    );
    
    CREATE UNIQUE INDEX [idx_employees_code] ON [dbo].[employees] ([code]);
    
    PRINT 'Tabla employees creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla employees ya existe';
END

-- Registrar esta migración
INSERT INTO [dbo].[migrations] ([name]) VALUES ('003_create_employees');