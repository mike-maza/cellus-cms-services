-- ====================================================================
-- AUTENTICACIÓN Y SEGURIDAD
-- ====================================================================
-- ============================== Save Employee ==============================
CREATE OR ALTER PROCEDurE sp_DashboardLogin
  @username NVARCHAR(MAX)
AS 
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    IF @username IS NULL OR LTRIM(RTRIM(@username)) = ''
            THROW 50001, 'Username es requerido', 1;

    SELECT
      usr.FirstName,
      usr.LastName,
      usr.EnabledUser AS Status,
      usr.Password,
      usr.Email
    FROM Users usr
    WHERE usr.Username = @username;
  END TRY
  BEGIN CATCH
    THROW;
  END CATCH
END;
-- ===========================================================================
-- ============================== Get Step User ==============================
CREATE OR ALTER PROCEDURE sp_UserGetSteps
  @username NVARCHAR(MAX)
AS 
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    IF @username IS NULL OR LTRIM(RTRIM(@username)) = ''
      THROW 50001, 'username es requerido', 1;

    SELECT
      TOP 1
      StepName AS step,
      Completed AS isComplete
    FROM "UserProcessSteps"
      WHERE Username = @username
      AND Completed = 0;

    IF @@ROWCOUNT = 0
            THROW 50003, 'Steps no encontrado', 1;

  END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;  
-- ===========================================================================
-- ============================== Get Step User ==============================
CREATE OR ALTER PROCEDURE sp_UserValidateAuthorizationCode
  @username NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    IF @username IS NULL OR LTRIM(RTRIM(@username)) = ''
      THROW 50001, 'username es requerido', 1;

    DECLARE @userId BIGINT,
      @token NVARCHAR(MAX);

    SELECT
      @userId = UserId
    FROM "Users"
    WHERE Username = @username;

    SELECT 
      Token
    WHERE Cod
  END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
-- ===========================================================================
-- ============================ Get Password User ============================
CREATE OR ALTER PROCEDURE sp_UserGetPassword
  @username NVARCHAR(MAX)
AS 
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    IF @username IS NULL OR LTRIM(RTRIM(@username)) = ''
      THROW 50001, 'username es requerido', 1;
    
    SELECT 
      Password
    FROM Users
    WHERE Username = @username

    IF @@ROWCOUNT = 0
      THROW 50002, 'Empleado no encontrado', 1;
  END TRY
  BEGIN CATCH
    THROW;
  END CATCH
END;
-- ===========================================================================
-- ========================== Changes Password User ==========================
CREATE OR ALTER PROCEDURE sp_UserChangePassword
  @username NVARCHAR(MAX),
  @newPassword NVARCHAR(MAX)
AS 
BEGIN 
  SET NOCOUNT ON;

  BEGIN TRY
    IF @username IS NULL OR LTRIM(RTRIM(@username)) = ''
      THROW 50001, 'username es requerido', 1;

    IF @newPassword IS NULL OR LTRIM(RTRIM(@newPassword)) = ''
      THROW 50001, 'newPassword es requerido', 1;

    IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = @username)
        THROW 50003, 'Usuario no encontrado', 1;

    UPDATE Users
      SET Password = @newPassword
    WHERE Username = @username;

    IF @@ROWCOUNT = 0
      THROW 50002, 'Usuario no encontrado', 1;
  END TRY
  BEGIN CATCH
    THROW;
  END CATCH
END;
-- ===========================================================================
-- ============================= Get All Company =============================
CREATE OR ALTER PROCEDURE sp_CompanyGetAll
AS 
BEGIN 
  SET NOCOUNT ON;

  BEGIN TRY
    SELECT 
      Name, 
      ShortName,
      PrimaryColor,
      TextColor,
      LogoPath,
      Status
    FROM Companies;
    
    IF @@ROWCOUNT = 0
      THROW 50002, 'Empresa no encontrada', 1;
  END TRY
  BEGIN CATCH
    THROW;
  END CATCH
END;
-- ===========================================================================
-- =========================== Get Company by ID =============================
CREATE OR ALTER PROCEDURE sp_CompanyGetById
  @name NVARCHAR(MAX)
AS 
BEGIN 
  SET NOCOUNT ON;

  BEGIN TRY
    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
      THROW 50001, 'name es requerido', 1;

    SELECT 
      Name, 
      ShortName,
      PrimaryColor,
      TextColor,
      LogoPath,
      Status
    FROM Companies 
    WHERE Name = @name;
    
    IF @@ROWCOUNT = 0
      THROW 50002, 'Empleado no encontrado', 1;
  END TRY
  BEGIN CATCH
    THROW;
  END CATCH
END;
-- ===========================================================================
-- ============================= Create Company ==============================
CREATE OR ALTER PROCEDURE sp_CompanyCreate
  @name NVARCHAR(MAX),
  @shorName NVARCHAR(75),
  @primaryColor NVARCHAR(MAX),
  @textColor NVARCHAR(MAX),
  @logoPath NVARCHAR(MAX),
  @status BIT
AS 
BEGIN 
  SET NOCOUNT ON;

  BEGIN TRY
    IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
      THROW 50001, 'name es requerido', 1;

    IF @shorName IS NULL OR LTRIM(RTRIM(@shorName)) = ''
      THROW 50001, 'shorName es requerido', 1;

    IF @primaryColor IS NULL OR LTRIM(RTRIM(@primaryColor)) = ''
      THROW 50001, 'primaryColor es requerido', 1;

    IF @textColor IS NULL OR LTRIM(RTRIM(@textColor)) = ''
      THROW 50001, 'textColor es requerido', 1;

    IF @logoPath IS NULL OR LTRIM(RTRIM(@logoPath)) = ''
      THROW 50001, 'logoPath es requerido', 1;

    IF @status IS NULL OR LTRIM(RTRIM(@status)) = ''
      THROW 50001, 'status es requerido', 1;

    -- Verificar si el empleado existe
        IF EXISTS (SELECT 1 FROM Companies WHERE Name = @name)
        BEGIN
            -- Si existe, actualizar
            UPDATE Companies
            SET 
                Name = @name,
                ShortName = @shorName,
                PrimaryColor = @primaryColor,
                TextColor = @textColor,
                LogoPath = @logoPath,
                Status = @status,
                UpdatedAt = GETDATE()  -- Si tienes este campo
            WHERE Name = @name;
            
            SELECT 'Empresa actualizada exitosamente' AS Mensaje;
        END
        ELSE
        BEGIN
            -- Si no existe, insertar
            INSERT INTO Companies (
                Name,
                ShortName,
                PrimaryColor,
                TextColor,
                LogoPath,
                Status
            )
            VALUES (
                @name,
                @shorName,
                @primaryColor,
                @textColor,
                @logoPath,
                @status
            );
            
            SELECT 'Empresa creada exitosamente' AS Mensaje;
        END
    
    IF @@ROWCOUNT = 0
      THROW 50002, 'Empresa no encontrada', 1;
  END TRY
  BEGIN CATCH
    THROW;
  END CATCH
END;