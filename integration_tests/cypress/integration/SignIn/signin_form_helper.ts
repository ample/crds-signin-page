export function fillAndSubmitSignInForm(username: string, password: string) {
  return cy.get('.primary-auth').within(() => {
    cy.get('#okta-signin-username').type(username);
    cy.get('#okta-signin-password').type(password, { log: false });
    cy.get('#okta-signin-submit').click();
  });
};