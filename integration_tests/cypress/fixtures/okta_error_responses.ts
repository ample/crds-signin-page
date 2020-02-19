import { OktaErrorResponse } from '../interfaces/OktaErrorResponse';

export const authenticationFailedResponse = (): OktaErrorResponse => {
  return {
    errorCode: 'E0000004',
    errorSummary: 'Authentication failed',
    errorLink: 'E0000004',
    errorId: '',
    errorCauses: []
  };
};

export const registrationFailureEmailExistsResponse = (): OktaErrorResponse => {
  return {
    errorCode: 'E0000001',
    errorSummary: 'Api validation failed: null',
    errorLink: 'E0000001',
    errorId: '',
    errorCauses: [
      {
        errorSummary: 'A user with this Email already exists',
        reason: 'UNIQUE_CONSTRAINT',
        locationType: 'body',
        domain: 'registration request'
      }
    ]
  };
};
