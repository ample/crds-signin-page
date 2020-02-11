export interface OktaErrorResponse {
  errorCode: string;
  errorSummary?: string;
  errorLink?: string;
  errorId?: string;
  errorCauses: OktaErrorCauses[];
}

export interface OktaErrorCauses {
  errorSummary: string;
  reason: string;
  locationType: string;
  domain: string;
}
