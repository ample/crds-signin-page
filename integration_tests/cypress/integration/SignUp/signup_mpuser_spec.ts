import { OK } from 'http-status-codes';
import { OktaAPI } from '../../APIs/OktaAPI';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { mpOnlyUser } from '../../fixtures/test_users';

describe('Sign Up scenario: Existing user with MP account only can register for Crossroads account', () => {
  beforeEach(() => {
    OktaEndpoint.endCurrentSession();
    OktaAPI.deleteUser(mpOnlyUser.username);

    /* Ignore known failures
    * -"Uncaught TypeError: Property description must be an object: a" and
    *    "Cannot set property 'status' of undefined"
    *    These seems to be related to the Shared Header.
    */
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Property description must be an object')) {
        return false; // Do not fail
      }
      if (err.message.includes("Cannot set property 'status' of undefined")) {
        return false; // Do not fail
      }
      return true;
    });
  });

  it('Verify user has new Okta account linked to existing MP account after completing Sign Up workflow', () => {
    cy.server();
    cy.route('POST', '/api/v1/registration/*/register').as('registerRequest');

    // Submit registration form
    cy.visit('/signin/register');
    cy.get('.registration').within(() => {
      cy.get('input[name="email"]').type(mpOnlyUser.username);
      cy.get('input[name="password"]').type(mpOnlyUser.password, { log: false });
      cy.get('input[name="firstName"]').type('Old');
      cy.get('input[name="lastName"]').type('McDonald');
      cy.get('input[type="submit"]').click();
    });

    // Verify response
    cy.wait('@registerRequest').then((response) => {
      expect(response).to.have.property('status', OK);
    });

    // Verify Okta user created, has pending email status and linked to existing MP contact ID
    OktaAPI.getUser(mpOnlyUser.username).then((response) => {
      expect(response).to.have.property('status', OK);
      expect(response).to.have.deep.property('body.status', 'PROVISIONED');
      expect(response).to.have.deep.property('body.profile.mpContactID', mpOnlyUser.mpContactId);
    });

    // Verify on email sent page
    const emailSentUrl = `${Cypress.config().baseUrl}/signin/register-complete`;
    cy.url().should('eq', emailSentUrl);

    // Click return link
    cy.get('.registration-complete').within(() => {
      cy.get('[data-se="back-link"]').as('returnSignin').click();
    });

    // Verify back on sign in page
    cy.get('#okta-signin-username').should('be.visible');
    cy.get('#okta-signin-password').should('be.visible');
  });
});
