-- Users table (MODIFICADA: removemos Role y CompanyId directo)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
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

-- UserCompanyAccess table (MODIFICADA: ahora incluye RoleId)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserCompanyAccess]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserCompanyAccess (
      UserCompanyAccessId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users (UserId) ON DELETE CASCADE,
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies (CompanyId) ON DELETE CASCADE,
      RoleId BIGINT FOREIGN KEY REFERENCES Roles (RoleId),
      IsDefault BIT DEFAULT 0,
      Status NVARCHAR(50) DEFAULT 'active',
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT UK_UserCompany UNIQUE (UserId, CompanyId)
    );
END;

-- UserPermissions table (permisos adicionales específicos por usuario - OPCIONAL)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserPermissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserPermissions (
      UserPermissionId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users (UserId) ON DELETE CASCADE,
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies (CompanyId) ON DELETE CASCADE,
      PermissionId BIGINT FOREIGN KEY REFERENCES Permissions (PermissionId) ON DELETE CASCADE,
      IsGranted BIT DEFAULT 1,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE(),
      CONSTRAINT UK_UserCompanyPermission UNIQUE (UserId, CompanyId, PermissionId)
    );
END;

-- UserSteps table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSteps]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserSteps (
      UserStepId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users (UserId) ON DELETE CASCADE,
      StepName NVARCHAR(MAX) NOT NULL,
      Completed BIT DEFAULT 0,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END;

-- =============================================
-- 1. TABLA: Roles
-- Descripción: Almacena los roles del sistema
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles] (
        RoleID INT PRIMARY KEY IDENTITY(1,1),
        Name VARCHAR(50) UNIQUE NOT NULL,
        Description VARCHAR(255),
        Active BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT GETDATE(),
        ModifiedDate DATETIME NULL
    );
    PRINT 'Tabla Roles creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Roles ya existe';
END;
  
-- =============================================
-- 2. TABLA: Permissions
-- Descripción: Catálogo de permisos del sistema (FIJOS)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Permissions] (
        PermissionID INT PRIMARY KEY IDENTITY(1,1),
        Code VARCHAR(50) UNIQUE NOT NULL,
        Description VARCHAR(255) NOT NULL,
        Module VARCHAR(50) NOT NULL,
        Active BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla Permissions creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla Permissions ya existe';
END;

-- =============================================
-- 3. TABLA: UserRole
-- Descripción: Relación entre usuarios y roles (1 usuario = 1 rol activo)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRole]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserRole] (
        UserRoleID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT NOT NULL,
        RoleID INT NOT NULL,
        AssignedDate DATETIME DEFAULT GETDATE(),
        Active BIT DEFAULT 1,
        AssignedBy INT NULL, -- ID del usuario que realizó la asignación
        CONSTRAINT UQ_UserRole_Active UNIQUE(UserID, RoleID)
    );
    PRINT 'Tabla UserRole creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla UserRole ya existe';
END;

-- =============================================
-- 4. TABLA: RolePermission
-- Descripción: Relación entre roles y permisos (M:N)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolePermission]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RolePermission] (
        RolePermissionID INT PRIMARY KEY IDENTITY(1,1),
        RoleID INT NOT NULL,
        PermissionID INT NOT NULL,
        AssignedDate DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_RolePermission UNIQUE(RoleID, PermissionID)
    );
    PRINT 'Tabla RolePermission creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla RolePermission ya existe';
END;

-- PaymentRequests table (relacionada con Users)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaymentRequests]') AND type in (N'U'))
BEGIN
    CREATE TABLE PaymentRequests (
      PaymentRequestId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users (UserId),
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies (CompanyId),
      RequestType NVARCHAR(MAX) NOT NULL,
      Status NVARCHAR(MAX) NOT NULL,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END;

-- AuditLogs table (MODIFICADA: incluye CompanyId)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE AuditLogs (
      AuditLogId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users (UserId),
      CompanyId BIGINT FOREIGN KEY REFERENCES Companies (CompanyId),
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

-- UserTwoFactor table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserTwoFactor]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserTwoFactor (
      UserTwoFactorId BIGINT PRIMARY KEY IDENTITY(1,1),
      UserId BIGINT FOREIGN KEY REFERENCES Users (UserId),
      Token NVARCHAR(MAX) NOT NULL,
      ExpiresAt DATETIME2,
      CreatedAt DATETIME2 DEFAULT GETDATE(),
      UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END; 2