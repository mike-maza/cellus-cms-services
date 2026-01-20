-- =============================================
-- Trigger: Sincronizar pago cuando se registra en bitácora
-- Descripción: Inserta automáticamente en Payments cuando se agrega 
--              un registro en BitacoraPayments para un empleado existente
-- =============================================
CREATE OR ALTER TRIGGER trg_SyncPaymentFromBitacora
ON BitacoraPayments
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que existan empleados relacionados antes de insertar
        IF EXISTS (
            SELECT 1 
            FROM Employees e 
            INNER JOIN inserted i ON e.CodEmployee = i.CodEmployee
        )
        BEGIN
            INSERT INTO Payments (
                CodEmployee,
                FullName,
                PaymentIndicator,
                SheetName,
                No_Authorization,
                NoBoleta,
                PayDay,
                UiAuthorization,
                Comments,
                BiweeklyAdvance,
                TotalOvertime,
                Bonus,
                Bonus79,
                TotalBiweeklyToPay,
                TotalDeductions,
                Total,
                AmountDays,
                DAY,
                MONTH,
                YEAR,
                Bonus14,
                BonusDecember,
                Accreditation1,
                Accreditation2,
                CreatedDateInvoice,
                UpdatedDateInvoice,
                UserWhoCreates,
                Employee_ID
            )
            SELECT 
                i.CodEmployee,
                i.FullName,
                i.PaymentIndicator,
                i.SheetName,
                e.No_authorization,
                i.NoBoleta,
                i.PayDay,
                i.UiAuthorization,
                i.Comments,
                i.BiweeklyAdvance,
                i.TotalOvertime,
                i.Bonus,
                i.Bonus79,
                i.TotalBiweeklyToPay,
                i.TotalDeductions,
                i.Total,
                i.AmountDays,
                i.DAY,
                i.MONTH,
                i.YEAR,
                i.Bonus14,
                i.BonusDecember,
                i.Accreditation1,
                i.Accreditation2,
                i.CreatedDateInvoice,
                i.UpdatedDateInvoice,
                i.UserWhoCreates,
                e.ID_EMPLOYEE
            FROM inserted i
            INNER JOIN Employees e ON i.CodEmployee = e.CodEmployee
            WHERE i.CodEmployee IS NOT NULL 
              AND LTRIM(RTRIM(i.CodEmployee)) <> '';
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;