import { signinUser, unverifiedEmailUser, lockedOutUser } from '../../fixtures/test_users';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { fillAndSubmitSignInForm, ignoreUncaughtException, verifyUIErrorMessage, listenForAuthn } from './sign_in_form_helper';
import {UNAUTHORIZED, OK} from 'http-status-codes';

//TODO fix uncaught exception issue - looks like it's broken on int, not running locally - probs an update problem
//TODO cleanup todos in this and dedupe
//TODO linting
//TODO dockerize for Team City

describe('Sign in scenarios', ()=>{
  beforeEach(() =>{
    OktaEndpoint.endCurrentSession();
    cy.clearLocalStorage();

    listenForAuthn();
  });

  describe('Redirects after successful sign in', () => {
    it('User starts on Sign In page, signs in and is redirected to homepage', () => {
      // TODO has issues with setting property "status" of undefined. Dirty workaround here
      // //ignoreUncaughtException();

      // Sign in
      cy.visit(Cypress.env("signinExtension"));
      fillAndSubmitSignInForm(signinUser.username, signinUser.password);

      // Verify url and token set
      cy.url().should('eq', `${Cypress.env("homepage")}/`);
      cy.window().its('localStorage').should('have.property', 'okta-token-storage');

      //TODO stub out problematic calls for HP load and other page loads
      //TODO get this to run, then update all the dependencies in the main package - they're really out of date
    });
  });

  describe('Invalid credentials', () => {
    it('User attempts to sign in with unregistered email and is shown error message', () => {
      //ignoreUncaughtException();

      // Sign in
      var unregisteredEmail = `fake-${signinUser.username}`;
      cy.visit(Cypress.env("signinExtension"));
      fillAndSubmitSignInForm(unregisteredEmail, signinUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });

    it('User attempts to sign in with malformed email and is shown error message', () => {
      //ignoreUncaughtException();

      // Sign In
      var malformedEmail = `fakemail.fakemail.com`;
      cy.visit(Cypress.env("signinExtension"));
      fillAndSubmitSignInForm(malformedEmail, signinUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });

    it('User attempts to sign in with invalid password is shown error message', () => {
      //ignoreUncaughtException();

      // Sign in
      var fakePassword = 'oupwpo48pu19roi;nwg';
      cy.visit(Cypress.env("signinExtension"));
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
      //ignoreUncaughtException();

      // Sign in
      cy.visit(Cypress.env("signinExtension"));
      fillAndSubmitSignInForm(unverifiedEmailUser.username, unverifiedEmailUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', UNAUTHORIZED);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      // Verify UI
      verifyUIErrorMessage();
    });

    it('Locked out user attempts to sign in, fills and submits Unlock Account form ', () => {
      //ignoreUncaughtException();
      OktaEndpoint.lockOutUser(lockedOutUser.username);

      // Sign in
      cy.visit(Cypress.env("signinExtension"));
      fillAndSubmitSignInForm(lockedOutUser.username, lockedOutUser.password);

      // Verify response
      cy.get('@authn').should('have.property', 'status', OK);
      cy.get('@authn').should('have.deep.property', 'response.body.status', 'LOCKED_OUT');

      // Verify unlock url
      var unlockUrl = `${Cypress.config().baseUrl}/signin/unlock`
      cy.url().should('eq', unlockUrl);

      // Fill unlock account form
      cy.get('.account-unlock').within(() => {
        cy.get('.okta-form-title').contains('Unlock account');
        cy.get('[name="username"]').as('emailField').type(lockedOutUser.username);
        cy.get('[data-se="email-button"]').as('submitEmail').click();
      });

      // Verify email sent url
      var unlockEmailedUrl = `${Cypress.config().baseUrl}/signin/unlock-emailed`
      cy.url().should('eq', unlockEmailedUrl);

      // Click return link
      cy.get('[data-se="back-button"]').as('returnSignin').click();

      // Verify sign in url
      var signinUrl = `${Cypress.config().baseUrl}${Cypress.env("signinExtension")}`
      // cy.url().should('eq', signinUrl); //TODO the url of this is just the baseurl - fix this
    });
  });
});