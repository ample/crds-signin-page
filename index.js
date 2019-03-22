var Utilities = require('./utilities');
var utils = new Utilities();

var OktaSignIn = require('@okta/okta-signin-widget');
var oktaSignInConfig = getOktaConfig();
var oktaSignInWidget = new OktaSignIn(oktaSignInConfig);

import './application.scss';

init();

function init() {
  //Handle redirect back to this page:
  if (oktaSignInWidget.token.hasTokensInUrl()) {
    setTokensFromUrlAndRedirect();
  } else {
    checkForAndHandleSession();
  }
}

function getOktaConfig() {
  var oktaBaseUrl = process.env.OKTA_BASE_URL;
  var oktaClientId = process.env.OKTA_CLIENT_ID;
  var oktaRedirectUri = process.env.OKTA_REDIRECT_URI;
  var oktaFacebookId = process.env.OKTA_FACEBOOK_CLIENT_ID;
  // var oktaGoogleId = process.env.OKTA_GOOGLE_CLIENT_ID;

  return {
    features: {
      registration: true, // Enable self-service registration flow
      //rememberMe: true,                   // Setting to false will remove the checkbox to save username
      //multiOptionalFactorEnroll: true,  // Allow users to enroll in multiple optional factors before finishing the authentication flow.
      selfServiceUnlock: true, // Will enable unlock in addition to forgotten password
      //smsRecovery: true,                // Enable SMS-based account recovery
      //callRecovery: true,               // Enable voice call-based account recovery
      //router: true,                       // Leave this set to true for the API demo
    },
    baseUrl: oktaBaseUrl,
    clientId: oktaClientId,
    redirectUri: oktaRedirectUri,
    authParams: {
      issuer: 'default',
      responseType: ['id_token', 'token'],
      display: 'page',
      scopes: ['openid', 'profile', 'email'],
    },
    idps: [
      { type: 'FACEBOOK', id: oktaFacebookId },
      // { type: "GOOGLE", id: oktaGoogleId },
    ],
    i18n: {
      en: {
        'account.unlock.email.or.username.placeholder': 'Email',
        'password.forgot.email.or.username.placeholder': 'Email',
        'primaryauth.username.placeholder': 'Email',
        'registration.signup.label': 'New to Crossroads?',
        'registration.signup.text': 'Create an account.',
      },
    },
  };
}

function setTokensFromUrlAndRedirect() {
  console.log('Tokens found in url');
  oktaSignInWidget.token.parseTokensFromUrl(
    function success(res) {
      addTokensToManager(res);
      // check access token for mpContactId
      // If no mpContactId
      // Then assume this is a brand new account
      // Send request to crossroads backend to create an mp account
      // wait for this to happen - spinny UI
      //
      redirectToOriginUrl();
    },
    function error(err) {
      console.error('handle error', err);
    }
  );
}

function checkForAndHandleSession() {
  oktaSignInWidget.session.get(function(res) {
    if (res.status === 'ACTIVE') {
      handleActiveSession();
    }
    // No session, or error retrieving the session. Render the Sign-In Widget.
    else if (res.status === 'INACTIVE') {
      setRedirectUrl();
      showSignInWidget();
    }
  });
}

function handleActiveSession() {
  if (isAccountActivation()) {
    // TODO: Create their MP Account
    // When that's done
    redirectToOriginUrl();
  } else {
    //Just redirect them
    redirectToOriginUrl();
  }
}

function isAccountActivation() {
  var type = utils.getUrlParam('type_hint');
  return type === 'ACTIVATION';
}

function setRedirectUrl() {
  var redirect_url = utils.getUrlParam('redirect_url');
  if (redirect_url) {
    utils.setCookie('redirect_url', redirect_url, 1);
  }

  window.history.replaceState(null, null, window.location.pathname);
}

function showSignInWidget() {
  console.log('No tokens in url, showing sign in screen');

  //Render the sign in widget
  oktaSignInWidget.renderEl(
    { el: '#widget-container' },
    function() {},
    function(err) {
      console.err(err);
    }
  );
}

function addTokensToManager(res) {
  oktaSignInWidget.tokenManager.add('id_token', res[0]);
  oktaSignInWidget.tokenManager.add('access_token', res[1]);
  console.log('Set your tokens in the manager');
}

function redirectToOriginUrl() {
  var redirect_url = utils.getCookie('redirect_url');
  utils.deleteCookie('redirect_url');

  if (redirect_url) {
    window.location.replace(redirect_url);
  } else {
    //Send them to the homepage
    window.location.replace('https://www.crossroads.net');
  }
}

function trackClicks() {
  const createAccountLink = $('.registration-link');
  const facebookButton = $('.social-auth-facebook-button');
  const forgotPasswordLink = $('.js-forgot-password');
  const helpLink = $('.js-help-link');
  const registerButton = $('.registration .button-primary');
  const resetViaEmail = $('.forgot-password .email-button');
  const signInButton = $('#okta-signin-submit.button-primary');
  const unlockAccountLink = $('.js-unlock');
  const unlockSendEmail = $('.account-unlock .email-button');

  if (createAccountLink) {
    createAccountLink.click(function() {
      analytics.track('CreateAccountLinkClicked', {});
    });
  }

  if (facebookButton) {
    facebookButton.click(function() {
      analytics.track('SignInFacebookButtonClicked', {});
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.click(function() {
      analytics.track('ForgotPasswordLinkClicked', {});
    });
  }

  if (helpLink) {
    helpLink.click(function() {
      analytics.track('HelpLinkClicked', {});
    });
  }

  if (registerButton) {
    registerButton.click(function() {
      console.log('RegisterButtonClicked');

      analytics.track('RegisterButtonClicked', {
        email: $('.o-form-input-name-email')
          .find('input')
          .val(),
        'first-name': $('.o-form-input-name-firstName')
          .find('input')
          .val(),
        'last-name': $('.o-form-input-name-lastName')
          .find('input')
          .val(),
      });
    });
  }

  if (resetViaEmail) {
    resetViaEmail.click(function() {
      analytics.track('ResetViaEmailClicked', {
        email: $('.o-form-input-name-username')
          .find('input')
          .val(),
      });
    });
  }

  if (signInButton) {
    signInButton.click(function() {
      console.log('SignInButtonClicked');

      analytics.track('SignInButtonClicked', {
        email: $('.o-form-input-name-username')
          .find('input')
          .val(),
      });
    });
  }

  if (unlockAccountLink) {
    unlockAccountLink.click(function() {
      analytics.track('UnlockAccountLinkClicked', {});
    });
  }

  if (unlockSendEmail) {
    unlockSendEmail.click(function() {
      analytics.track('UnlockAccountSendEmailClicked', {
        email: $('.o-form-input-name-username')
          .find('input')
          .val(),
      });
    });
  }
}

oktaSignInWidget.on('pageRendered', function() {
  console.log('Page Rendered');

  trackClicks();
});
