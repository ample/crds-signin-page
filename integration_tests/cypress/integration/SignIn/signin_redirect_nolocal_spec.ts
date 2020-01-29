import { OktaAPI } from '../../APIs/OktaAPI';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { signinUser } from '../../fixtures/test_users';
import { fillAndSubmitSignInForm } from './signin_form_helper';

function verifyOktaTokenStored() {
  cy.window().its('localStorage').should('have.property', 'okta-token-storage');
}

/*
  * Cypress is only able to initiate navigate between pages on the same domain within
  *   one test file https://docs.cypress.io/guides/references/trade-offs.html#Same-origin.
  * These tests should not be run against a locally hosted Sign In page since they will
  *   redirect to a different superdomain after a successful signin and the tests will fail.
  */
describe('Sign in scenarios: user is redirected after successful sign in', () => {
  before(() => {
    OktaAPI.unlockUser(signinUser.oktaId); // TODO check if unlocked before unlocking
  });

  beforeEach(() => {
    OktaEndpoint.endCurrentSession();

    /* Ignore known failures
     * -"Cannot set property 'status' of undefined"
     *    This seems to be related to the Shared Header.
     */
    cy.on('uncaught:exception', (error, runnable) => {
      if (error.message.includes("Cannot set property 'status' of undefined")) {
        return false;
      }
      return true;
    });

    cy.server();
    cy.route('POST', '/api/v1/authn').as('authRequest');
  });

  it('Verify UI workflow for successful sign and redirect: Sign In page -> Redirected to homepage', () => {
    // Sign in
    cy.visit(Cypress.env('signinExtension'));
    fillAndSubmitSignInForm(signinUser.username, signinUser.password);
    cy.wait('@authRequest');

    // Verify on correct page and token set
    cy.url().should('contain', `${Cypress.env('homepage')}/`);
    verifyOktaTokenStored();
  });

  it('Verify successful sign in is redirected UI workflow: Some CRDS page -> Sign In page -> Redirected to previous CRDS page', () => {
    // Navigate to some page
    const startingPage = `${Cypress.config().baseUrl}/groups/`;
    cy.visit(startingPage);

    // Sign in
    cy.visit(Cypress.env('signinExtension'));
    fillAndSubmitSignInForm(signinUser.username, signinUser.password);
    cy.wait('@authRequest');

    // Verify on correct page and token set
    cy.url().should('eq', startingPage);
    verifyOktaTokenStored();
  });
});
