import { TestUser } from "../interfaces/TestUser";

export class OktaEndpoint {
  /* If test is re-run in the same browser the Okta widget is able to find the user session and logs the user in,
   *   even if cookies and local storage is cleared. Call this function to force an open session to end before
   *   each test.
   */
  public static endCurrentSession() {
    const endSessionRequest = {
      method: 'DELETE',
      url: `${Cypress.env('OKTA_ENDPOINT')}/api/v1/sessions/me`,
      failOnStatusCode: false
    };

    cy.request(endSessionRequest);
  }

  /*
  * Okta admins cannot set a user's state to "locked out" directly, so this attempts to authenticate a user
  *    using an invalid password until the user is locked out.
  * Note that a user account is automatically unlocked after some time has passed.
  */
  public static lockOutUser(username: string) {
    const lockOutRequest = this.createAuthnRequest(username, '123');
    lockOutRequest.failOnStatusCode = false;

    const makeRequest = (count: number) => {
      cy.request(lockOutRequest)
      .then((resp) => {
        if (resp.body.status === 'LOCKED_OUT' || count <= 0) {
          return;
        }

        const newCount = --count;
        makeRequest(newCount);
      });
    };

    const countToLockout = 10;
    makeRequest(countToLockout);
  }

  private static createAuthnRequest(username: string, password: string){
    return {
      method: 'POST',
      url: `${Cypress.env('OKTA_ENDPOINT')}/api/v1/authn`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        username,
        password
      },
      failOnStatusCode: true
    };
  }
}
