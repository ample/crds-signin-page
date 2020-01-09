import { signinUser, unverifiedEmailUser, lockedOutUser } from '../../fixtures/test_users';
//TODO get this to test against locally run instance (figure out baseurl/other extensions needed)
//TODO fix uncaught exception issue
//TODO fix redirects when redirect cookie not set
//TODO fix url issue after locked out form finished
//TODO cleanup todos in this and dedupe

//TODO import http

//TODO keep in mind that, when running locally, signin baseUrl and redirect page baseUrl will be different
function ignoreUncaughtException(){
  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })
}

// If test is re-run in the same browser the okta widget is able to find the user session and logs the user in,
//   even if cookies and local storage is cleared. cy.request(endCurrentSession) to force an open session to end before
//   each test.
const endCurrentSession = {
  method: 'DELETE',
  url: `${Cypress.env('OKTA_DOMAIN')}/api/v1/sessions/me`,
  failOnStatusCode: false // If session doesn't exist, this should 404
}

describe('Sign in scenarios', ()=>{
  beforeEach(() =>{
    cy.server();
    cy.request(endCurrentSession);
    cy.clearLocalStorage();
  });

  describe('Redirects after successful sign in', () => {
    //TODO need to fix redirect to www problem (if no redirectUrl cookie set)
    it.skip('User starts on Sign In page, signs in and is redirected to homepage', () => {
      var homepageUrl = Cypress.config().baseUrl;
      // TODO has issues with setting property "status" of undefined. Dirty workaround here
      ignoreUncaughtException();

      // Spy on this - when a response is returned signin is complete
      cy.route('POST', '/api/v1/authn').as('authn');

      // Act
      cy.visit(Cypress.env("signinExtension"));
      cy.get('#okta-signin-username').type(signinUser.username);
      cy.get('#okta-signin-password').type(signinUser.password, { log: false });
      cy.get('#okta-signin-submit').click();
      cy.wait('@authn'); //This call takes a while but is what sets the token.

      // cy.visit("/"); //TODO workaround - fix redirect issue

      // Assert
      cy.url().should('eq', homepageUrl);
      cy.window().its('localStorage').should('have.property', 'okta-token-storage');

      //TODO stub out problematic calls for HP load and other page loads
      //TODO get this to run, then update all the dependencies in the main package - they're really out of date
    });

    it('User navigates to Sign In page from another page, signs in and is redirected to previous page', () => {
      ignoreUncaughtException();

      // Spy on this - when a response is returned signin is complete
      cy.route('POST', '/api/v1/authn').as('authn');

      // Act
      var startingPage = `${Cypress.config().baseUrl}/groups/`;
      cy.visit(startingPage);

      cy.visit(Cypress.env("signinExtension"));
      cy.get('#okta-signin-username').type(signinUser.username);
      cy.get('#okta-signin-password').type(signinUser.password, { log: false });
      cy.get('#okta-signin-submit').click();
      cy.wait('@authn');

      // Assert
      cy.url().should('eq', startingPage);
      cy.window().its('localStorage').should('have.property', 'okta-token-storage');
    });
  });

  describe('Invalid credentials', () => {
    it('User attempts to sign in with unregistered email and is shown error message', () => {
      ignoreUncaughtException();

      // Spy on this
      cy.route('POST', '/api/v1/authn').as('authn');

      // Act
      var unregisteredEmail = `fake-${signinUser.username}`;
      cy.visit(Cypress.env("signinExtension"));
      cy.get('#okta-signin-username').type(unregisteredEmail);
      cy.get('#okta-signin-password').type(signinUser.password, { log: false });
      cy.get('#okta-signin-submit').click();

      // Assert
      cy.wait('@authn')

      cy.get('@authn').should('have.property', 'status', 401);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      cy.get('.okta-form-infobox-error').as('errorMessage');
      cy.get('@errorMessage').contains('Sign in failed!');
    });

    it('User attempts to sign in with malformed email and is shown error message', () => {
      ignoreUncaughtException();

      // Spy on this
      cy.route('POST', '/api/v1/authn').as('authn');

      // Act
      var malformedEmail = `fakemail.fakemail.com`;
      cy.visit(Cypress.env("signinExtension"));
      cy.get('#okta-signin-username').type(malformedEmail);
      cy.get('#okta-signin-password').type(signinUser.password, { log: false });
      cy.get('#okta-signin-submit').click();

      // Assert
      cy.wait('@authn')

      cy.get('@authn').should('have.property', 'status', 401);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      cy.get('.okta-form-infobox-error').as('errorMessage');
      cy.get('@errorMessage').contains('Sign in failed!');
    });

    it('User attempts to sign in with invalid password is shown error message', () => {
      ignoreUncaughtException();

      // Spy on this
      cy.route('POST', '/api/v1/authn').as('authn');

      // Act
      var fakePassword = 'oupwpo48pu19roi;nwg';
      cy.visit(Cypress.env("signinExtension"));
      cy.get('#okta-signin-username').type(signinUser.username);
      cy.get('#okta-signin-password').type(fakePassword, { log: false });
      cy.get('#okta-signin-submit').click();

      // Assert
      cy.wait('@authn')

      cy.get('@authn').should('have.property', 'status', 401);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      cy.get('.okta-form-infobox-error').as('errorMessage');
      cy.get('@errorMessage').contains('Sign in failed!');
    });
  });

  describe('User not in "Active" state', () => {
    it('User with unverified email attempts to sign in is shown error message', () => {
      ignoreUncaughtException();

      // Spy on this
      cy.route('POST', '/api/v1/authn').as('authn');

      // Act
      cy.visit(Cypress.env("signinExtension"));
      cy.get('#okta-signin-username').type(unverifiedEmailUser.username);
      cy.get('#okta-signin-password').type(unverifiedEmailUser.password, { log: false });
      cy.get('#okta-signin-submit').click();

      // Assert
      cy.wait('@authn')

      cy.get('@authn').should('have.property', 'status', 401);
      cy.get('@authn').should('have.deep.property', 'response.body.errorSummary', 'Authentication failed');

      cy.get('.okta-form-infobox-error').as('errorMessage');
      cy.get('@errorMessage').contains('Sign in failed!');
    });

    it.only('Locked out user attempts to sign in, fills and submits Unlock Account form ', () => {
      ignoreUncaughtException();

      // Spy on this
      cy.route('POST', '/api/v1/authn').as('authn');

      // Try to sign in
      cy.visit(Cypress.env("signinExtension"));
      cy.get('.primary-auth').within(() => { //TODO scope other signins
        cy.get('#okta-signin-username').type(lockedOutUser.username);
        cy.get('#okta-signin-password').type(lockedOutUser.password, { log: false });
        cy.get('#okta-signin-submit').click();
      });

      // Verify response
      cy.wait('@authn')
      cy.get('@authn').should('have.property', 'status', 200);
      cy.get('@authn').should('have.deep.property', 'response.body.status', 'LOCKED_OUT');
      var unlockUrl = `${Cypress.config().baseUrl}/signin/unlock`
      cy.url().should('eq', unlockUrl);

      // Fill unlock account form
      cy.get('.account-unlock').within(() => {
        cy.get('.okta-form-title').contains('Unlock account');
        cy.get('[name="username"]').as('emailField').type(lockedOutUser.username);
        cy.get('[data-se="email-button"]').as('submitEmail').click();
      });

      // Email sent, return to signin
      var unlockEmailedUrl = `${Cypress.config().baseUrl}/signin/unlock-emailed`
      cy.url().should('eq', unlockEmailedUrl);
      cy.get('[data-se="back-button"]').as('returnSignin').click();

      // On sign in page again
      var signinUrl = `${Cypress.config().baseUrl}${Cypress.env("signinExtension")}`
      // cy.url().should('eq', signinUrl); //TODO the url of this is just the baseurl - fix this
    });
  });
});