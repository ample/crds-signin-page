import { OK } from 'http-status-codes';
import { OktaAPI } from '../../APIs/OktaAPI';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { newUser } from '../../fixtures/test_users';

// - New user signs up (email does not exist in Okta or MP) - verify post-signup form screen displayed, verify Okta account created with Pending User Action status.

// TODO - probs need to add a "delete test user" endpoint to Identity - lock it down to users in Test group so can't be misused

describe('Sign Up scenario: New user can register for Crossroads account', () => {
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

  it('Verify new user has Okta and MP account after completing Sign Up workflow', () => {
    // pre: delete user from Okta and MP - fail if not successful
    // TODO ^

    cy.server();
    cy.route('POST', '/api/v1/registration/*/register').as('registerRequest');

    // Navigate to registration page
    cy.visit(Cypress.env('signinExtension'));
    cy.get('.primary-auth').within(() => {
      cy.get('.registration-link').click();
    });

    // Fill registration page
    cy.get('.registration').within(() => {
      cy.get('input[name="email"]').type(newUser.username);
      cy.get('input[name="password"]').type(newUser.password, { log: false });
      cy.get('input[name="firstName"]').type('Curious');
      cy.get('input[name="lastName"]').type('George');
      cy.get('input[type="submit"]').click();
    });

    // Verify response
    cy.wait('@registerRequest').then((response) => {
      expect(response).to.have.property('status', OK);
      // TODO more details?
      // expect(response).to.have.deep.property('response.body.errorCauses[0]')
      //   .and.equal(registrationFailureEmailExistsResponse().errorCauses[0]);
    });

    // Verify on email sent page
    // TODO

    // Verify Okta user created, has pending email status and MP contact ID linked
    OktaAPI.getUser(newUser.username).then((response) => {
      expect(response).to.have.property('status', OK);
      expect(response).to.have.deep.property('response.body.status', 'PROVISIONED');
      // TODO this may not be accurate
      expect(response).to.have.deep.property('response.body.profile.mpContactID').to.not.be.empty;
    });
  });
});
