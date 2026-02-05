export interface UserValidationResult {
  isValid: boolean;
  name?: string;
}

export interface UserValidatorPort {
  validate(email: string): Promise<UserValidationResult>;
}

export const USER_VALIDATOR_PORT = Symbol('USER_VALIDATOR_PORT');
