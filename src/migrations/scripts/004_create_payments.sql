-- Migración 004: Crear tabla de pagos
-- Fecha: 2024-07-03

-- Tabla de pagos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[payments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[payments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [employee_id] INT NOT NULL,
        [payment_type] NVARCHAR(50) NOT NULL,
        [amount] DECIMAL(18, 2) NOT NULL,
        [payment_date] DATE NOT NULL,
        [period_start] DATE NULL,
        [period_end] DATE NULL,
        [status] NVARCHAR(50) NOT NULL DEFAULT 'pending',
        [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_payments_employees] FOREIGN KEY ([employee_id]) REFERENCES [dbo].[employees] ([id])
    );
    
    CREATE INDEX [idx_payments_employee_id] ON [dbo].[payments] ([employee_id]);
    CREATE INDEX [idx_payments_payment_date] ON [dbo].[payments] ([payment_date]);
    
    PRINT 'Tabla payments creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla payments ya existe';
END

-- Registrar esta migración
INSERT INTO [dbo].[migrations] ([name]) VALUES ('004_create_payments');