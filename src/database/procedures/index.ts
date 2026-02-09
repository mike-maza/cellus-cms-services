export const PROCEDURES = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION & USERS
  // --------------------------------------------------------------------------
  LOGIN: 'spDB_AuthenticateUser',
  GET_USERS: 'spDB_GetAllUsers',
  CREATE_USER: 'spDB_CreateUser',
  UPDATE_USER: 'spDB_UserUpdate',
  GET_PASSWORD: 'spDB_UserGetPassword',
  CHANGES_PASSWORD: 'spDB_ChangeUserPassword',
  VALIDATE_AUTHORIZATION_CODE: 'sp_UserValidateAuthorizationCode',
  LOGOUT: 'sp_UserLogout', // Unused

  // --------------------------------------------------------------------------
  // USER PROFILES
  // --------------------------------------------------------------------------
  GET_PROFILE: 'spDB_GetProfileInformation',
  UPDATED_PROFILE: 'sp_ProfileUpdate',

  // --------------------------------------------------------------------------
  // SESSIONS
  // --------------------------------------------------------------------------
  GET_ACTIVE_SESSIONS: 'sp_SessionGetActive',
  CLOSE_SESSION: 'sp_SessionClose',
  CREATE_SESSION: 'spDB_CreateSession',
  CLOSE_ALL_SESSIONS: 'sp_SessionCloseAll',
  CLOSE_DEVICE_SESSIONS: 'sp_SessionCloseDeviceSessions',
  UPDATE_SESSION_ACTIVITY: 'sp_SessionUpdateActivity',
  GET_SESSION_HISTORY: 'sp_SessionGetHistory',

  // --------------------------------------------------------------------------
  // 2FA (TWO FACTOR AUTHENTICATION)
  // --------------------------------------------------------------------------
  GET_ALL_DEVICES_OF_2FA: 'spDB_2FA_GetDevicesByUser',
  GET_DEVICE_2FA_BY_ID: 'spDB_2FA_GetDeviceByUserAndId',
  CREATE_NEW_DEVICE_2FA: 'spDB_2FA_DeviceRegister',
  DELETE_DEVICE_2FA: 'spDB_deleteDeviceOf2FA',

  // --------------------------------------------------------------------------
  // ROLES & PERMISSIONS
  // --------------------------------------------------------------------------
  GET_ROLES: 'sp_RoleGetAll',
  GET_ROLE_BY_USERNAME: 'spDB_RoleGetByUsername',
  CREATE_ROLE: 'sp_RoleCreate',
  UPDATE_ROLE: 'sp_RoleUpdate',
  GET_PERMISSIONS: 'sp_PermissionGetAll',
  GET_PERMISSIONS_BY_ROLE: 'sp_GetPermissionsByRole',
  GET_ROLES_WITH_DETAILS: 'sp_GetRolesWithDetails',
  ASIGN_ROLE: 'spDB_AssignRoleToUser',
  DISACTIVATE_ROLE: 'spDB_DeactivateUserRole',

  // --------------------------------------------------------------------------
  // EMPLOYEES
  // --------------------------------------------------------------------------
  GET_EMPLOYEES: 'spDB_GetAllEmployees',
  GET_EMPLOYEES_METADATA: 'spDB_GetEmployeesMetadata',
  CREATE_EMPLOYEE: 'sp_CreatedEmployee',
  UPDATE_EMPLOYEE: 'spDB_UpdateEmployeeInformation',
  UPDATE_EMPLOYEE_WORKFLOW: 'spDB_UpdateEmployeeStepStatus',

  // --------------------------------------------------------------------------
  // PAYMENTS & BOLETAS
  // --------------------------------------------------------------------------
  GET_PAYMENTS: 'sp_PaymentGetAll',
  GET_PAYMENTS_METADATA: 'spDB_GetPaymentsMetadata',
  VERIFY_PAYMENT_EXISTS: 'spDB_VerifyEmployeePaymentExists',
  GET_PAYMENT_BY_ID: 'sp_getPaymentById',
  CREATED_PAYMENT: 'spDB_CreatePaymentRecord',
  CREATED_PAYMENT_DEDUCTIONS: 'spDB_PaymentDeductionCreate',
  GET_DATA_SEND_BOLETO_ORNATO: 'sp_BoletoOrnato_GetDataSend', // Unused
  SIGN_PAYMENT_ON_BEHALF: 'sp_SignPaymentOnBehalf', // Unused/Commented usage

  // --------------------------------------------------------------------------
  // STEPS / WORKFLOW
  // --------------------------------------------------------------------------
  GET_STEPS_USER: 'spDB_GetNextUserStep',
  RESET_USER_STEP: 'spDB_ResetUserStep',
  GET_STEP_BY_USERNAME: 'spDB_StepGetByUsername',
  UPDATE_STEP: 'spDB_UpdateUserStep',

  // --------------------------------------------------------------------------
  // COMPANIES
  // --------------------------------------------------------------------------
  GET_COMPANIES: 'sp_CompanyGetAll',
  GET_COMPANY_BY_ID: 'sp_CompanyGetById',
  CREATE_COMPANY: 'sp_CompanyCreateOrUpdate',
  // UPDATE_COMPANY: 'sp_CompanyUpdate',

  // --------------------------------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------------------------------
  DASHBOARD_DATA: 'spDB_GetDataRelevant',

  // --------------------------------------------------------------------------
  // SIGNATURES & OTHERS
  // --------------------------------------------------------------------------
  SAVE_SIGNATURE: 'sp_SignatureSave', // Unused
  CHANGES_SIGNATURE: 'sp_SignatureChange' // Unused

  /*
  // --------------------------------------------------------------------------
  // LOCATIONS (COUNTRIES, CITIES - UNUSED)
  // --------------------------------------------------------------------------
  GET_COUNTRIES: 'sp_CountryGetAll',
  GET_COUNTRY_BY_ID: 'sp_CountryGetById',
  CREATE_COUNTRY: 'sp_CountryCreate',
  UPDATE_COUNTRY: 'sp_CountryUpdate',

  GET_CITIES: 'sp_CityGetAll',
  GET_CITY_BY_ID: 'sp_CityGetById',
  CREATE_CITY: 'sp_CityCreate',
  UPDATE_CITY: 'sp_CityUpdate',
  */
}
