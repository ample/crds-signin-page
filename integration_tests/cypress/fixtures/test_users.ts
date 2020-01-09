import { TestUser } from '../interfaces/TestUser';

// Use for Signin tests
export const signinUser: TestUser = { //TODO create real test user
  username: 'mingogirl@gmail.com',
  password: Cypress.env('MINGO_PW'),
  oktaId: '00uojf2ew2yQtRjhr0h7',
  mpContactId: '7824100'
};

export const unverifiedEmailUser: TestUser = {
  username: 'mpcrds+auto+signin-page+busy_bee@gmail.com',
  password: Cypress.env('TEST_PASSWORD_BEE'),
  oktaId: '00up6wfgktqHxfuey0h7',
  mpContactId: '7834596'
}

export const lockedOutUser: TestUser = {
  username: 'mpcrds+auto+signin-page+edward_scissorhands@gmail.com',
  password: Cypress.env('TEST_PASSWORD_SCISSORHANDS'),
  oktaId: '00up6x6so2dbTCayl0h7',
  mpContactId: '7834597'
}