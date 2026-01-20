
-- Migration for Company: TEST
-- Generated at: 2025-12-15T16:50:22.032Z

-- =============================================
-- 1. Create Employees Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees_test')
BEGIN
    CREATE TABLE Employees_test (
        Id INT PRIMARY KEY IDENTITY(1,1),
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) UNIQUE,
        Position NVARCHAR(100),
        HireDate DATETIME DEFAULT GETDATE(),
        Status NVARCHAR(20) DEFAULT 'Active'
    );
    PRINT 'Tabla Employees_test creada.';

    -- Seed Data (Initial Admin/Rep)
    INSERT INTO Employees_test (FirstName, LastName, Email, Position)
    VALUES ('Rodrigo', 'Admin', 'admin@test.com', 'Representante Legal');
END

-- =============================================
-- 2. Create Payments Table
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payments_test')
BEGIN
    CREATE TABLE Payments_test (
        Id INT PRIMARY KEY IDENTITY(1,1),
        EmployeeId INT,
        Amount DECIMAL(18,2) NOT NULL,
        Currency NVARCHAR(3) DEFAULT 'GTQ',
        PaymentDate DATETIME DEFAULT GETDATE(),
        Status NVARCHAR(20) DEFAULT 'Pending',
        Description NVARCHAR(255),
        FOREIGN KEY (EmployeeId) REFERENCES Employees_test(Id)
    );
    PRINT 'Tabla Payments_test creada.';
END

-- =============================================
-- 3. Stored Procedures
-- =============================================

-- SP: Get All Employees
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetEmployees_test')
    DROP PROCEDURE sp_GetEmployees_test
GO

CREATE PROCEDURE sp_GetEmployees_test
AS
BEGIN
    SELECT * FROM Employees_test;
END
GO

-- SP: Create Payment
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreatePayment_test')
    DROP PROCEDURE sp_CreatePayment_test
GO

CREATE PROCEDURE sp_CreatePayment_test
    @EmployeeId INT,
    @Amount DECIMAL(18,2),
    @Description NVARCHAR(255)
AS
BEGIN
    INSERT INTO Payments_test (EmployeeId, Amount, Description)
    VALUES (@EmployeeId, @Amount, @Description);
    
    SELECT SCOPE_IDENTITY() as NewPaymentId;
END
GO
