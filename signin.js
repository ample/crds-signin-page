import {setCookie, deleteCookie, getCookie, getUrlParam} from './utils.js'

var OktaSignIn = require("@okta/okta-signin-widget");

var oktaSignInConfig = getOktaConfig();
var oktaSignInWidget = new OktaSignIn(oktaSignInConfig);

//Handle redirect back to this page:
if (oktaSignInWidget.token.hasTokensInUrl()) {
    setTokensFromUrlAndRedirect();
}
else {
    checkForAndHandleSession();
}

function getOktaConfig(){
    return  {
                features: {
                    registration: true,                 // Enable self-service registration flow
                    //rememberMe: true,                   // Setting to false will remove the checkbox to save username
                    //multiOptionalFactorEnroll: true,  // Allow users to enroll in multiple optional factors before finishing the authentication flow.
                    //selfServiceUnlock: true,          // Will enable unlock in addition to forgotten password
                    //smsRecovery: true,                // Enable SMS-based account recovery
                    //callRecovery: true,               // Enable voice call-based account recovery
                    //router: true,                       // Leave this set to true for the API demo
                },
                baseUrl: 'https://crossroads.oktapreview.com',
                clientId: '0oahgpg7elMxVJedi0h7',
                redirectUri: 'http://localhost:8000/signin.html',
                authParams: {
                    issuer: 'default',
                    responseType: ['id_token', 'token'],
                    display: 'page',
                    scopes: ['openid', 'profile', 'email']
                },
                idps: [
                    {type: 'FACEBOOK', id: '0oai46jjrzZEabvTR0h7'},
                    {type: 'GOOGLE', id: '0oai51vvoweCSDtyN0h7'}
                ]
            }
}

function setTokensFromUrlAndRedirect() {
    console.log("Tokens found in url");
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
        // TODO: Create their MP Account
        // When that's done
        redirectToOriginUrl();
    }
    else {
        //Just redirect them
        redirectToOriginUrl();
    }
}

function isAccountActivation() {
    var type = getUrlParam('type_hint');
    return type === 'ACTIVATION';
}

function setRedirectUrl() {
    var redirect_url = getUrlParam('redirect_url');
    if (redirect_url) {
        setCookie('redirect_url', redirect_url, 1);
    }

    window.history.replaceState(null, null, window.location.pathname);
}

function showSignInWidget() {
    console.log("No tokens in url, showing sign in screen");

    //Render the sign in widget
    oktaSignInWidget.renderEl({el: '#widget-container'},
        function() {},
        function(err) { console.err(err) });
}

function addTokensToManager(res) {
    oktaSignInWidget.tokenManager.add('id_token', res[0]);
    oktaSignInWidget.tokenManager.add('access_token', res[1]);
    console.log("Set your tokens in the manager");
}

function redirectToOriginUrl() {
    var redirect_url = getCookie("redirect_url");
    deleteCookie('redirect_url');

    if (redirect_url) {
        window.location.replace(redirect_url);
    }
    else {
        //Send them to the homepage
        window.location.replace('https://www.crossroads.net');
    }
}