export class OktaAPI {
  public static unlockUser(oktaId: string) {
    const unlockUserRequest = {
      method: 'POST',
      url: `${Cypress.env('OKTA_API_SUBDOMAIN')}api/v1/users/${oktaId}/lifecycle/unlock`,
      headers: {
        Authorization: `SSWS ${Cypress.env('OKTA_API_TESTING_TOKEN')}`
      },
      failOnStatusCode: false // Don't fail if user not locked out
    };
    return cy.request(unlockUserRequest);
  }

  public static getUser(email: string){
    const getUserRequest = {
      method: 'GET',
      url: `${Cypress.env('OKTA_API_SUBDOMAIN')}api/v1/users/${email}`,
      headers: {
        Authorization: `SSWS ${Cypress.env('OKTA_API_TESTING_TOKEN')}`
      },
      failOnStatusCode: false // Don't fail if user doesn't exist
    };
    return cy.request(getUserRequest);
  }
}
