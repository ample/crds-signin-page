import { BAD_REQUEST } from 'http-status-codes';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { registrationFailureEmailExistsResponse } from '../../fixtures/okta_error_responses';
import { signinUser } from '../../fixtures/test_users';

describe('Sign Up scenario: User must sign up with unique email', () => {
  beforeEach(() => {
    OktaEndpoint.endCurrentSession();

    /* Ignore known failures
    * -"Uncaught TypeError: Property description must be an object: a" and
    *    "Cannot set property 'status' of undefined"
    *    These seems to be related to the Shared Header.
    */
    // TODO are these still necessary?
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

  it('Verify user can not sign up with same email as another user', () => {
    cy.server();
    cy.route('POST', '/api/v1/registration/*/register').as('registerRequest');

    // Submit registration form
    cy.visit('/signin/register');
    cy.get('.registration').within(() => {
      cy.get('input[name="email"]').type(signinUser.username);
      cy.get('input[name="password"]').type(signinUser.password, { log: false });
      cy.get('input[name="firstName"]').type('Golden');
      cy.get('input[name="lastName"]').type('Goose');
      cy.get('input[type="submit"]').click();
    });

    // Verify response
    cy.wait('@registerRequest').then((response) => {
      expect(response).to.have.property('status', BAD_REQUEST);
      expect(response).to.have.deep.property('response.body.errorCauses[0]')
        .and.equal(registrationFailureEmailExistsResponse().errorCauses[0]);
    });

    // Verify UI
    const failureMessage = 'A user with this Email already exists';
    cy.get('.registration').within(() => {
      cy.get('.okta-form-infobox-error').as('errorMessage');
      cy.get('@errorMessage').contains(failureMessage);
    });
  });
});
