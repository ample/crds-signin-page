import { NOTFOUND } from 'dns';
import { NOT_FOUND } from 'http-status-codes';

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

  public static getUser(email: string) {
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

  public static deleteUser(email: string) {
    // Users must be deactivated before they are deleted
    const deactivateUserRequest = {
      method: 'POST',
      url: `${Cypress.env('OKTA_API_SUBDOMAIN')}api/v1/users/${email}/lifecycle/deactivate`,
      headers: {
        Authorization: `SSWS ${Cypress.env('OKTA_API_TESTING_TOKEN')}`
      },
      failOnStatusCode: false
    };

    const deleteUserRequest = {
      method: 'DELETE',
      url: `${Cypress.env('OKTA_API_SUBDOMAIN')}api/v1/users/${email}`,
      headers: {
        Authorization: `SSWS ${Cypress.env('OKTA_API_TESTING_TOKEN')}`
      }
    };

    return cy.request(deactivateUserRequest).then((daResponse) => {
      // Stop process if user doesn't exist
      if (daResponse.status === NOT_FOUND) {
        return;
      }
      return cy.request(deleteUserRequest);
    });
  }
}
