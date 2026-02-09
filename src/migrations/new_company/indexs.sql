-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índice en UserRole por UserID (búsquedas frecuentes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserRole_UserID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserRole_UserID
    ON [dbo].[UserRole] (UserID)
    INCLUDE (RoleID, Active);
    PRINT 'Índice IX_UserRole_UserID creado';
END

-- Índice en UserRole por RoleID
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserRole_RoleID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserRole_RoleID
    ON [dbo].[UserRole] (RoleID)
    INCLUDE (UserID, Active);
    PRINT 'Índice IX_UserRole_RoleID creado';
END

-- Índice en RolePermission por RoleID
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RolePermission_RoleID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_RolePermission_RoleID
    ON [dbo].[RolePermission] (RoleID)
    INCLUDE (PermissionID);
    PRINT 'Índice IX_RolePermission_RoleID creado';
END

-- Índice en Permissions por Code (validaciones frecuentes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Permissions_Code')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Permissions_Code
    ON [dbo].[Permissions] (Code)
    INCLUDE (PermissionID, Active);
    PRINT 'Índice IX_Permissions_Code creado';
END

-- Índice en Permissions por Module
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Permissions_Module')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Permissions_Module
    ON [dbo].[Permissions] (Module)
    INCLUDE (Code, Description, Active);
    PRINT 'Índice IX_Permissions_Module creado';
END

-- Índice en AuditLog por fecha y usuario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditLog_Date_User')
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLog_Date_User
    ON [dbo].[AuditLog] (LogDate DESC, UserID);
    PRINT 'Índice IX_AuditLog_Date_User creado';
END