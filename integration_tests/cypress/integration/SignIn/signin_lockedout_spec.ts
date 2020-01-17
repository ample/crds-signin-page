import { OK } from 'http-status-codes';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { lockedOutUser } from '../../fixtures/test_users';
import { fillAndSubmitSignInForm } from './signin_form_helper';

describe('Sign in scenarios: user is locked out', () => {
  before(() => {
    OktaEndpoint.lockOutUser(lockedOutUser.username);
  });

  beforeEach(() => {
    OktaEndpoint.endCurrentSession();
  });

  it('Verify locked out UI workflow: Sign In page -> Unlock page -> Email Sent page -> Sign In page', () => {
    /* Ignore known failures
    * -"Uncaught TypeError: Property description must be an object: a"
    *    This seems to be related to the Shared Header.
    */
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Property description must be an object')) {
        return false; // Do not fail
      }
      return true;
    });

    // Setup listener for calls
    cy.server();
    cy.route('POST', '/api/v1/authn').as('authRequest');
    cy.route('POST', '/api/v1/authn/recovery/unlock').as('unlockRequest');

    // Sign in from sign in page
    cy.visit(Cypress.env('signinExtension'));
    fillAndSubmitSignInForm(lockedOutUser.username, lockedOutUser.password);

    // Verify response
    cy.wait('@authRequest').then((response) => {
      expect(response).to.have.property('status', OK);
      expect(response).to.have.deep.property('response.body.status', 'LOCKED_OUT');
    });

    // Verify on unlock page
    const unlockUrl = `${Cypress.config().baseUrl}/signin/unlock`;
    cy.url().should('eq', unlockUrl);

    // Fill unlock account form
    cy.get('[data-se="email-button"]').as('submitEmail').should('be.visible')
    .then(() => {
      cy.get('.account-unlock').within(() => {
        cy.get('.okta-form-title').contains('Unlock account');
        cy.get('[name="username"]').type(lockedOutUser.username);
        cy.get('@submitEmail').click();
      });
    });

    // Verify unlock request sent
    cy.wait('@unlockRequest');

    // Verify on email sent confirmation page
    const unlockEmailedUrl = `${Cypress.config().baseUrl}/signin/unlock-emailed`;
    cy.url().should('eq', unlockEmailedUrl);

    // Click return link
    cy.get('[data-se="back-button"]').as('returnSignin').click();

    // Verify back on sign in page
    const signinUrl = `${Cypress.config().baseUrl}${Cypress.env('signinExtension')}`;
    cy.url().should('eq', signinUrl);
  });
});
