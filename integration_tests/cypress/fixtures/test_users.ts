import { TestUser } from '../interfaces/TestUser';

/* Use for Signin tests */
// Active user
export const signinUser: TestUser = {
  username: 'mpcrds+auto+signin-page+golden_goose@gmail.com',
  password: Cypress.env('TEST_PASSWORD_GOOSE'),
  oktaId: '00up8je0l2LwY5XVw0h7',
  mpContactId: '7835155'
};

// Unverified email
export const unverifiedEmailUser: TestUser = {
  username: 'mpcrds+auto+signin-page+busy_bee@gmail.com',
  password: Cypress.env('TEST_PASSWORD_BEE'),
  oktaId: '00up6wfgktqHxfuey0h7',
  mpContactId: '7834596'
};

// Use for locked out testing
//   Okta auto-unlocks after some time so account will need to be re-locked
export const lockedOutUser: TestUser = {
  username: 'mpcrds+auto+signin-page+edward_scissorhands@gmail.com',
  password: Cypress.env('TEST_PASSWORD_SCISSORHANDS'),
  oktaId: '00up6x6so2dbTCayl0h7',
  mpContactId: '7834597'
};
