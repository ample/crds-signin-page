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
