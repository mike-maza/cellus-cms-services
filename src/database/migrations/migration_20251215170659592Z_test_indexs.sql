-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índice en UserRole_test por UserID (búsquedas frecuentes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserRole_UserID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserRole_UserID_test
    ON [dbo].[UserRole_test] (UserID)
    INCLUDE (RoleID, Active);
    PRINT 'Índice IX_UserRole_UserID creado';
END

-- Índice en UserRole_test por RoleID
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserRole_RoleID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_UserRole_RoleID_test
    ON [dbo].[UserRole_test] (RoleID)
    INCLUDE (UserID, Active);
    PRINT 'Índice IX_UserRole_RoleID creado';
END

-- Índice en RolePermission_test por RoleID
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RolePermission_RoleID')
BEGIN
    CREATE NONCLUSTERED INDEX IX_RolePermission_RoleID_test
    ON [dbo].[RolePermission_test] (RoleID)
    INCLUDE (PermissionID);
    PRINT 'Índice IX_RolePermission_RoleID creado';
END

-- Índice en Permissions_test por Code (validaciones frecuentes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Permissions_Code')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Permissions_Code_test
    ON [dbo].[Permissions_test] (Code)
    INCLUDE (PermissionID, Active);
    PRINT 'Índice IX_Permissions_Code creado';
END

-- Índice en Permissions_test por Module
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Permissions_Module')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Permissions_Module_test
    ON [dbo].[Permissions_test] (Module)
    INCLUDE (Code, Description, Active);
    PRINT 'Índice IX_Permissions_Module creado';
END

-- Índice en AuditLog por fecha y usuario
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditLog_Date_User')
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLog_Date_User_test
    ON [dbo].[AuditLog] (LogDate DESC, UserID);
    PRINT 'Índice IX_AuditLog_Date_User creado';
END