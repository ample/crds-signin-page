import {setCookie, deleteCookie, getCookie} from './utils.js'

var OktaSignIn = require("@okta/okta-signin-widget");

var oktaSignInConfig = getOktaConfig();
var oktaSignInWidget = new OktaSignIn(oktaSignInConfig);

//Handle redirect back to this page:
if (oktaSignInWidget.token.hasTokensInUrl()) {
    setTokensFromUrl();
}
else {
    setRedirectUrl();
    showSignInWidget();
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
                    responseType: ['id_token','token'],
                    display: 'page'
                },
                idps: [
                    {type: 'FACEBOOK', id: '0oai46jjrzZEabvTR0h7'},
                    {type: 'GOOGLE', id: '0oai51vvoweCSDtyN0h7'}
                ]
            }
}

function setTokensFromUrl(){
    console.log("Tokens found in url");
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

function setRedirectUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    
    var redirect_url = urlParams.get('redirect_url');
    setCookie("redirect_url", redirect_url, 1);
    window.history.replaceState(null, null, window.location.pathname);
}

function showSignInWidget(){
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
    deleteCookie("redirect_url");
    window.location.replace(redirect_url);
}