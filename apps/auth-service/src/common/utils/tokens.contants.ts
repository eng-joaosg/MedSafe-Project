//=========================================================================
// APPLICATION
//=========================================================================

export const FIND_EMAIL_CLIENT_USER_USECASE = 'IFindCLientUserUseCase';
export const REGISTER_CLIENT_USER_USECASE = 'IRegisterClientUserUseCase';
export const VERIFY_ACCOUNT_CLIENT_USER_USECASE = 'IVerifyAccountClientUserUseCase';
export const LOGIN_CLIENT_USER_USECASE = 'ILoginCLientUserUseCase';
export const CHANGE_PASSWORD_CLIENT_USER_USECASE = 'IChangePasswordClientUserUseCase';
export const ASSOCIATE_CLINICAL_INFO_USECASE = 'IAssociateClinicalInfoUseCase';
export const CHANGE_NAME_CLIENT_USER_USECASE = 'IChangeNameClientUserUseCase';

export const CLIENT_USER_MAPPER = 'IClientUserMapper';

//=========================================================================
// INFRA
//=========================================================================

export const NOTIFICATION_SERVICE = 'INotificationService';
export const VERIFICATION_CODE_SERVICE = 'IVerificationCodeService';
export const HASH_SERVICE = 'IHashService';
export const TOKEN_SERVICE = 'ITokenService';

export const CLIENT_USER_REPOSITORY = 'IClientUserRepository';

export const DATABASE_GATEWAY = 'IDatabaseGateway';
export const NOTIFICATION_GATEWAY = 'INotificationGateway';
