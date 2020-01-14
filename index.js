var Utilities = require('./utilities');
var debug = true;
var utils = new Utilities(debug);
const contentful = require("contentful");

var OktaSignIn = require('@okta/okta-signin-widget/dist/js/okta-sign-in.min.js');
var oktaSignInConfig = getOktaConfig();

oktaSignInConfig = handlePasswordRecoveryToken(oktaSignInConfig);

var oktaSignInWidget = new OktaSignIn(oktaSignInConfig);

const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ENV = process.env.CONTENTFUL_ENV;
const CRDS_APP_ENDPOINT = process.env.CRDS_APP_ENDPOINT;

import './application.scss';

init();

function init() {
  getContent();
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
  // var oktaFacebookId = process.env.OKTA_FACEBOOK_CLIENT_ID;
  // var oktaGoogleId = process.env.OKTA_GOOGLE_CLIENT_ID;
  utils.log(`DEBUG!!! getOktaConfig redirectUrl = ${oktaRedirectUri}`);
  return {
    features: {
      registration: true, // Enable self-service registration flow
      //rememberMe: true,                   // Setting to false will remove the checkbox to save username
      //multiOptionalFactorEnroll: true,  // Allow users to enroll in multiple optional factors before finishing the authentication flow.
      selfServiceUnlock: true, // Will enable unlock in addition to forgotten password
      //smsRecovery: true,                // Enable SMS-based account recovery
      //callRecovery: true,               // Enable voice call-based account recovery
      router: true,                       // Leave this set to true for the API demo
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
      // { type: 'FACEBOOK', id: oktaFacebookId },
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
  utils.log('Tokens found in url');

  oktaSignInWidget.token.parseTokensFromUrl(
    function success(res) {
      addTokensToManager(res);
      redirectToOriginUrl();
    },
    function error(err) {
      console.error('handle error', err);
    }
  );
}

function handlePasswordRecoveryToken(signInConfig) {
  var recoverPasswordToken = utils.getUrlParam('recovery_token')
  if (recoverPasswordToken) {
    oktaSignInConfig.recoveryToken = recoverPasswordToken
  }

  return signInConfig;
}

function checkForAndHandleSession() {
  oktaSignInWidget.session.get(function (res) {
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
  var redirectUrl = utils.getUrlParam('redirectUrl');
  if (redirectUrl) {
    utils.setCookie('redirectUrl', redirectUrl, 1);
  }
  window.history.replaceState(null, null, window.location.pathname);
}

function showSignInWidget() {
  utils.log('No tokens in url, showing sign in screen');

  //Render the sign in widget
  oktaSignInWidget.renderEl(
    { el: '#widget-container' },
    function () { },
    function (err) {
      console.error(err);
    }
  );
}

function addTokensToManager(res) {
  oktaSignInWidget.tokenManager.add('id_token', res[0]);
  oktaSignInWidget.tokenManager.add('access_token', res[1]);

  utils.log('Set your tokens in the manager');
}

function redirectToOriginUrl() {
  var redirectUrl = utils.getCookie('redirectUrl');

  if (redirectUrl) {
    window.location.replace(redirectUrl);
  } else {
    //Send them to the homepage
    window.location.replace(CRDS_APP_ENDPOINT);
  }
}

function getContent() {
  const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: CONTENTFUL_SPACE_ID,
    environment: CONTENTFUL_ENV,
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: CONTENTFUL_ACCESS_TOKEN
  });
  // This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.
  client
    .getEntries({
      'content_type': 'content_block',
      'fields.slug': 'signin',
    })
    .then(entries => {
      document.getElementById("signin-content").innerHTML = entries.items[0].fields.content;
    })
    .catch(err => console.error(err));
}

function analyticsTrack(eventName, payload){
  console.log(`DEBUG!!!! trying to track analytics. Is analytics defined? ${window.analytics !== undefined}`); //TODO remove
  if(window.analytics !== undefined)
  {
    window.analytics.track(eventName, payload);
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

  if (createAccountLink.length > 0) {
    createAccountLink.click(function () {
      analyticsTrack('CreateAccountLinkClicked', {});
    });
  }

  if (facebookButton.length > 0) {
    facebookButton.click(function () {
      analyticsTrack('SignInFacebookButtonClicked', {});
    });
  }

  if (forgotPasswordLink.length > 0) {
    forgotPasswordLink.click(function () {
      analyticsTrack('ForgotPasswordLinkClicked', {});
    });
  }

  if (helpLink.length > 0) {
    helpLink.click(function () {
      analyticsTrack('HelpLinkClicked', {});
    });
  }

  if (registerButton.length > 0) {
    registerButton.click(function () {
      analyticsTrack('RegisterButtonClicked', {
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

  if (resetViaEmail.length > 0) {
    resetViaEmail.click(function () {
      analyticsTrack('ResetViaEmailClicked', {
        email: $('.o-form-input-name-username')
          .find('input')
          .val(),
      });
    });
  }

  if (signInButton.length > 0) {
    signInButton.click(function () {
      analyticsTrack('SignInButtonClicked', {
        email: $('.o-form-input-name-username')
          .find('input')
          .val(),
      });
    });
  }

  if (unlockAccountLink.length > 0) {
    unlockAccountLink.click(function () {
      analyticsTrack('UnlockAccountLinkClicked', {});
    });
  }

  if (unlockSendEmail.length > 0) {
    unlockSendEmail.click(function () {
      analyticsTrack('UnlockAccountSendEmailClicked', {
        email: $('.o-form-input-name-username')
          .find('input')
          .val(),
      });
    });
  }
}

oktaSignInWidget.on('pageRendered', function () {
  // Wait for analytics to be defined before tracking clicks
  if(window.analytics) {
    utils.log('window.analytics found on pageRendered');
    trackClicks();
  } else {
    utils.log('Wait for window.analytics to be defined');
    Object.defineProperties(window, 'analytics', {
      configurable: true,
      get: function() {
        return this._analytics;
      },
      set: function(val) {
        utils.log('window.analytics defined, tracking clicks');
        this._analytics = val;
        trackClicks();
      }
    })
  }
});
