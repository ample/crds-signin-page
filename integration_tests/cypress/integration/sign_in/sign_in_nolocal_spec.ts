import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { signinUser } from '../../fixtures/test_users';
import { fillAndSubmitSignInForm, ignoreUncaughtException, listenForAuthn } from './sign_in_form_helper';

describe('Sign in scenarios', () => {
  beforeEach(() => {
    OktaEndpoint.endCurrentSession();
    cy.clearLocalStorage();

    listenForAuthn();
  });

  describe('Redirects after successful sign in', () => {
    /* Cypress is only able to initiate navigate between pages on the same domain within one test file, so this test
    *    is not runnable when service is hosted locally.
    */
    it('User navigates to Sign In page from another page, signs in and is redirected to previous page', () => {
      // ignoreUncaughtException();

      // Navigate to some page
      const startingPage = `${Cypress.config().baseUrl}/groups/`;
      cy.visit(startingPage);

      // Sign in
      cy.visit(Cypress.env('signinExtension'));
      fillAndSubmitSignInForm(signinUser.username, signinUser.password);

      // Verify url and token set
      cy.url().should('eq', startingPage);
      cy.window().its('localStorage').should('have.property', 'okta-token-storage');
    });
  });

});
