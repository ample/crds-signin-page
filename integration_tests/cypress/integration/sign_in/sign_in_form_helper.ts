export function listenForAuthn() {
  cy.server();
  cy.route('POST', '/api/v1/authn').as('authn');
}

export function fillAndSubmitSignInForm(username: string, password: string) {
  return cy.get('.primary-auth').within(() => {
    cy.get('#okta-signin-username').type(username);
    cy.get('#okta-signin-password').type(password, { log: false });
    cy.get('#okta-signin-submit').click();
    // Wait for the auth call to be returned before continuing
    cy.wait('@authn');
  });
}

export function verifyUIErrorMessage(message: string = 'Sign in failed!') {
  cy.get('.primary-auth').within(() => {
    cy.get('.okta-form-infobox-error').as('errorMessage');
    cy.get('@errorMessage').contains(message);
  });
}

export function ignoreUncaughtException() {
  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  });
}
