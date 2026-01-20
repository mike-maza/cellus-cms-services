-- Users_test table (MODIFICADA: removemos Role y CompanyId directo)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users_test (
      UserId BIGINT PRIMARY KEY IDENTITY(1,1),
      FirstName NVARCHAR(MAX) NOT NULL,
      LastName NVARCHAR(MAX) NOT NULL,
      Email NVARCHAR(450) NOT NULL UNIQUE,
      Username NVARCHAR(75) NOT NULL UNIQUE,
      Password NVARCHAR(MAX) NOT NULL,
      EnabledUser BIT DEFAULT 1,
      TwoFactorEnabled BIT DEFAULT 0,
      LastLoginAt DATETIME2,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END;

-- UserCompanyAccess_test table (MODIFICADA: ahora incluye RoleId)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserCompanyAccess_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserCompanyAccess_test (
      UserCompanyAccessId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users_test (UserId) ON DELETE CASCADE,
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies_test (CompanyId) ON DELETE CASCADE,
      RoleId BIGINT FOREIGN KEY REFERENCES Roles_test (RoleId),
      IsDefault BIT DEFAULT 0,
      Status NVARCHAR(50) DEFAULT 'active',
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT UK_UserCompany_test UNIQUE (UserId, CompanyId)
    );
END;

-- UserPermissions_test table (permisos adicionales específicos por usuario - OPCIONAL)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserPermissions_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserPermissions_test (
      UserPermissionId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users_test (UserId) ON DELETE CASCADE,
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies_test (CompanyId) ON DELETE CASCADE,
      PermissionId BIGINT FOREIGN KEY REFERENCES Permissions_test (PermissionId) ON DELETE CASCADE,
      IsGranted BIT DEFAULT 1,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT UK_UserCompanyPermission_test UNIQUE (UserId, CompanyId, PermissionId)
    );
END;

-- UserSteps_test table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSteps_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserSteps_test (
      UserStepId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users_test (UserId) ON DELETE CASCADE,
      StepName NVARCHAR(MAX) NOT NULL,
      Completed BIT DEFAULT 0,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END;

-- =============================================
-- 1. TABLA: Roles_test
-- Descripción: Almacena los roles del sistema
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles_test] (
        RoleID INT PRIMARY KEY IDENTITY(1,1),
        Name VARCHAR(50) UNIQUE NOT NULL,
        Description VARCHAR(255),
        Active BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT GETDATE(),
        ModifiedDate DATETIME NULL
    );
    PRINT 'Tabla Roles_test creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Roles_test ya existe';
END;
  
-- =============================================
-- 2. TABLA: Permissions_test
-- Descripción: Catálogo de permisos del sistema (FIJOS)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permissions_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Permissions_test] (
        PermissionID INT PRIMARY KEY IDENTITY(1,1),
        Code VARCHAR(50) UNIQUE NOT NULL,
        Description VARCHAR(255) NOT NULL,
        Module VARCHAR(50) NOT NULL,
        Active BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla Permissions_test creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Permissions_test ya existe';
END;

-- =============================================
-- 3. TABLA: UserRole_test
-- Descripción: Relación entre usuarios y roles (1 usuario = 1 rol activo)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRole_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserRole_test] (
        UserRoleID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT NOT NULL,
        RoleID INT NOT NULL,
        AssignedDate DATETIME DEFAULT GETDATE(),
        Active BIT DEFAULT 1,
        AssignedBy INT NULL, -- ID del usuario que realizó la asignación
        CONSTRAINT UQ_UserRole_Active_test UNIQUE(UserID, RoleID)
    );
    PRINT 'Tabla UserRole_test creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla UserRole_test ya existe';
END;

-- =============================================
-- 4. TABLA: RolePermission_test
-- Descripción: Relación entre roles y permisos (M:N)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolePermission_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RolePermission_test] (
        RolePermissionID INT PRIMARY KEY IDENTITY(1,1),
        RoleID INT NOT NULL,
        PermissionID INT NOT NULL,
        AssignedDate DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_RolePermission_test UNIQUE(RoleID, PermissionID)
    );
    PRINT 'Tabla RolePermission_test creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla RolePermission_test ya existe';
END;

-- PaymentRequests_test table (relacionada con Users_test)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaymentRequests_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE PaymentRequests_test (
      PaymentRequestId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users_test (UserId),
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies_test (CompanyId),
      RequestType NVARCHAR(MAX) NOT NULL,
      Status NVARCHAR(MAX) NOT NULL,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END;

-- AuditLogs_test table (MODIFICADA: incluye CompanyId)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE AuditLogs_test (
      AuditLogId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users_test (UserId),
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies_test (CompanyId),
      Action NVARCHAR(MAX) NOT NULL,
      Module NVARCHAR(100) NOT NULL,
      TableName NVARCHAR(MAX) NOT NULL,
      RecordId BIGINT NOT NULL,
      OldValue NVARCHAR(MAX),
      NewValue NVARCHAR(MAX),
      IpAddress NVARCHAR(50),
      UserAgent NVARCHAR(MAX),
      CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END;

-- UserTwoFactor_test table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserTwoFactor_test]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserTwoFactor_test (
      UserTwoFactorId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users_test (UserId),
      Token NVARCHAR(MAX) NOT NULL,
      ExpiresAt DATETIME2,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END;