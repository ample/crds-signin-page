import { mpOnlyUser } from "../../fixtures/test_users";
import { OK } from "http-status-codes";
import { OktaAPI } from "../../APIs/OktaAPI";

//- User with MP account signs up (same flow as New user)

//TODO may need custom endpoint to remove Okta user but not MP user - like new user enpoint, lock this down to test users

describe('Sign Up scenario: Existing user with MP account only can register for Crossroads account', () => {
  it('Verify user has new Okta account linked to existing MP account after completing Sign Up workflow', () => {
    // pre: delete user from Okta but not MP - fail if not successful - possibly record MP contact id?
    // TODO ^

    cy.server();
    cy.route('POST', '/api/v1/registration/*/register').as('registerRequest');

    // Submit registration form
    cy.visit(`${Cypress.env('signinExtension')}/signin/register`);
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
      // TODO more details?
      // expect(response).to.have.deep.property('response.body.errorCauses[0]')
      //   .and.equal(registrationFailureEmailExistsResponse().errorCauses[0]);
    });

    // Verify on email sent page
    // TODO

    // Verify Okta user created, has pending email status and linked to existing MP contact ID
    OktaAPI.getUser(mpOnlyUser.username).then((response) => {
      expect(response).to.have.property('status', OK);
      expect(response).to.have.deep.property('response.body.status', 'PROVISIONED');
      expect(response).to.have.deep.property('response.body.profile.mpContactID', mpOnlyUser.mpContactId);
    });
  });
});
