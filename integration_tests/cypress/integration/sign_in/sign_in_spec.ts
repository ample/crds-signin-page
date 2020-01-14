import {OK, UNAUTHORIZED} from 'http-status-codes';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { lockedOutUser, signinUser, unverifiedEmailUser } from '../../fixtures/test_users';
import { fillAndSubmitSignInForm, ignoreUncaughtException, listenForAuthn, verifyUIErrorMessage } from './sign_in_form_helper';

// TODO dockerize for Team City - TODO fix up issues - connect to cypress dashboard and turn on video for debugging.
// TODO cleanup todos in this and dedupe
// TODO stub out problematic calls for HP load and other page loads?
// TODO readme for running tests
// TODO look at unit tests

describe('Sign in scenarios', () => {
  beforeEach(() => {
    OktaEndpoint.endCurrentSession();
    // cy.clearLocalStorage();

    listenForAuthn();
  });

  describe('Redirects after successful sign in', () => {
    it('User starts on Sign In page, signs in and is redirected to homepage', () => {
      // TODO has issues with setting property "status" of undefined. Dirty workaround here
      // //ignoreUncaughtException();

      // If this always returns nothing, will always fail with analytics error? NO. failure does not happen
      // cy.route('/api/contentblock?category[]=common', {});

      // Sign in
      // TODO try waiting until window.analytics is true before continuing? analytics triggered when page rendered
      // TODO try waiting for pagerendered call before continuing?
      cy.visit(Cypress.env('signinExtension'));
      // cy.wait('@contentBlock');
      // // cy.window().should('have.property', 'analytics'); //TODO temp tests
      fillAndSubmitSignInForm(signinUser.username, signinUser.password);

      // Verify url and token set
      cy.url().should('contain', `${Cypress.env('homepage')}/`);
      cy.window().its('localStorage').should('have.property', 'okta-token-storage');
    });
  });

  describe('Invalid credentials', () => {
    it('User attempts to sign in with unregistered email and is shown error message', () => {
      // ignoreUncaughtException();

      // Sign in
      const unregisteredEmail = `fake-${signinUser.username}`;
      cy.visit(Cypress.env('signinExtension'));
      // cy.window().should('have.property', 'analytics'); // TODO temp tests
      fillAndSubmitSignInForm(unregisteredEmail, signinUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });

    it('User attempts to sign in with malformed email and is shown error message', () => {
      // ignoreUncaughtException();

      // Sign In
      const malformedEmail = `fakemail.fakemail.com`;
      cy.visit(Cypress.env('signinExtension'));
      // cy.window().should('have.property', 'analytics'); // TODO temp tests
      fillAndSubmitSignInForm(malformedEmail, signinUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });

    it('User attempts to sign in with invalid password is shown error message', () => {
      // ignoreUncaughtException();

      // Sign in
      const fakePassword = 'oupwpo48pu19roi;nwg';
      cy.visit(Cypress.env('signinExtension'));
      // cy.window().should('have.property', 'analytics'); // TODO temp tests
      fillAndSubmitSignInForm(signinUser.username, fakePassword);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });
  });

  describe('User not in "Active" state', () => {
    it('User with unverified email attempts to sign in is shown error message', () => {
      // ignoreUncaughtException();

      // Sign in
      cy.visit(Cypress.env('signinExtension'));
      // cy.window().should('have.property', 'analytics'); // TODO temp tests
      fillAndSubmitSignInForm(unverifiedEmailUser.username, unverifiedEmailUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });

    it('Locked out user attempts to sign in, fills and submits Unlock Account form ', () => {
      // ignoreUncaughtException();
      OktaEndpoint.lockOutUser(lockedOutUser.username);

      // Sign in
      cy.visit(Cypress.env('signinExtension'));
      // cy.window().should('have.property', 'analytics'); // TODO temp tests
      fillAndSubmitSignInForm(lockedOutUser.username, lockedOutUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', OK);
      cy.get('@authn').should('have.deep.property', 'response.body.status', 'LOCKED_OUT');

      // Verify unlock url
      const unlockUrl = `${Cypress.config().baseUrl}/signin/unlock`;
      cy.url().should('eq', unlockUrl);

      // Fill unlock account form
      cy.get('.account-unlock').within(() => {
        cy.get('.okta-form-title').contains('Unlock account');
        cy.get('[name="username"]').as('emailField').type(lockedOutUser.username);
        cy.get('[data-se="email-button"]').as('submitEmail').click();
      });

      // Verify email sent url
      const unlockEmailedUrl = `${Cypress.config().baseUrl}/signin/unlock-emailed`;
      cy.url().should('eq', unlockEmailedUrl);

      // Click return link
      cy.get('[data-se="back-button"]').as('returnSignin').click();

      // Verify sign in url
      const signinUrl = `${Cypress.config().baseUrl}${Cypress.env('signinExtension')}`;
      // cy.url().should('eq', signinUrl); //TODO the url of this is just the baseurl - fix this
    });
  });
});
