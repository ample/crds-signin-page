import { UNAUTHORIZED } from 'http-status-codes';
import { OktaAPI } from '../../APIs/OktaAPI';
import { OktaEndpoint } from '../../APIs/OktaEndpoint';
import { authenticationFailedResponse } from '../../fixtures/okta_error_responses';
import { signinUser, unverifiedEmailUser } from '../../fixtures/test_users';
import { fillAndSubmitSignInForm } from './signin_form_helper';

// TODO dockerize for Team City
// TODO readme for running tests
// TODO look at unit tests

describe('Sign in scenarios: user is not authorized to sign in', () => {
  before(() => {
    OktaAPI.unlockUser(signinUser.oktaId); // TODO check if unlocked before unlocking
  });

  beforeEach(() => {
    OktaEndpoint.endCurrentSession();
  });

  const unauthorizedScenarios =
    [
      {
        scenario: 'user with unverified email',
        username: unverifiedEmailUser.username,
        password: unverifiedEmailUser.password
      },
      {
        scenario: 'user with invalid password',
        username: signinUser.username,
        password: 'fakepassword123'
      },
      {
        scenario: 'user signing in with malformed email',
        username: 'fakemail.fakemail.com',
        password: signinUser.password
      },
      {
        scenario: 'unregistered user',
        username: `fake-${signinUser.username}`,
        password: signinUser.password
      }
    ];

  unauthorizedScenarios.forEach((test) => {
    it(`Verify UI workflow for ${test.scenario}: Sign In page -> Error message displayed`, () => {
      // Setup listener for authn call
      cy.server();
      cy.route('POST', '/api/v1/authn').as('authRequest');

      // Sign in
      cy.visit(Cypress.env('signinExtension'));
      fillAndSubmitSignInForm(test.username, test.password);

      // Verify response
      const expectedResponse = authenticationFailedResponse();
      cy.wait('@authRequest').then((response) => {
        expect(response).to.have.property('status', UNAUTHORIZED);
        expect(response).to.have.deep.property('response.body.errorSummary', expectedResponse.errorSummary);
        expect(response).to.have.deep.property('response.body.errorCode', expectedResponse.errorCode);
        expect(response).to.have.deep.property('response.body.errorLink', expectedResponse.errorLink);
      });

      // Verify UI
      const failureMessage = 'Sign in failed!';
      cy.get('.primary-auth').within(() => {
        cy.get('.okta-form-infobox-error').as('errorMessage');
        cy.get('@errorMessage').contains(failureMessage);
      });
    });
  });
});
