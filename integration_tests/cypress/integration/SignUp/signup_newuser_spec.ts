import { OK } from 'http-status-codes';
import { OktaAPI } from '../../APIs/OktaAPI';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { TestUser } from '../../interfaces/TestUser';
const uuid = require('uuid/v4');

function generateTemporaryTestUser(): TestUser {
  const uniqueID = uuid();
  const tempEmail = `mpcrds+auto+temp+signin-page+${uniqueID}@gmail.com`;
  const tempUser: TestUser = {
    username: tempEmail,
    password: Cypress.env('TEST_PASSWORD_TEMP'),
    oktaId: ''
  };
  return tempUser;
}

describe('Sign Up scenario: New user can register for Crossroads account', () => {
  let newUser: TestUser;

  beforeEach(() => {
    OktaEndpoint.endCurrentSession();
    newUser = generateTemporaryTestUser();
    /* Ignore known failures
    * -"Uncaught TypeError: Property description must be an object: a" and
    *    "Cannot set property 'status' of undefined"
    *    These seems to be related to the Shared Header.
    */
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

  afterEach(() => {
    OktaAPI.deleteUser(newUser.username);
  });

  it('Verify new user has Okta and MP account after completing Sign Up workflow', () => {
    cy.server();
    cy.route('POST', '/api/v1/registration/*/register').as('registerRequest');

    // Navigate to registration page through link
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
    });

    // Verify Okta user created, has pending email status and MP contact ID linked
    OktaAPI.getUser(newUser.username).then((response) => {
      expect(response).to.have.property('status', OK);
      expect(response).to.have.deep.property('body.status', 'PROVISIONED');
      expect(response).to.have.deep.property('body.profile.mpContactID').to.not.be.empty;
    });

    // Verify on email sent page
    const emailSentUrl = `${Cypress.config().baseUrl}/signin/register-complete`;
    cy.url().should('eq', emailSentUrl);

    // Click return link
    cy.get('.registration-complete').within(() => {
      cy.get('[data-se="back-link"]').as('returnSignin').click();
    });

    // Verify back on sign in page
    cy.get('#okta-signin-username').should('be.visible');
    cy.get('#okta-signin-password').should('be.visible');
  });
});
