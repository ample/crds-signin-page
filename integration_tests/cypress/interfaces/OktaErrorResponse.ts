export interface OktaErrorResponse {
  errorCode: string;
  errorSummary?: string;
  errorLink?: string;
  errorId?: string;
  errorCauses: [];
}
