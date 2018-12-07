var oktaAuthJsConfig = {
    url: 'https://crossroads.oktapreview.com',
    issuer: 'https://crossroads.oktapreview.com/oauth2/default',
    clientId: '0oahgpg7elMxVJedi0h7',
    redirectUri: 'http://localhost:8000/signin.html',
    authParams: {
        issuer: 'default',
        responseType: ['id_token','token'],
        display: 'page'
    },
    // tokenManager: {
    //     storage: 'cookie'
    // }
}
var oktaAuthClient = new OktaAuth(oktaAuthJsConfig);

oktaAuthClient.session.exists()
.then(function(exists)
{
    if (exists){
        console.log("YESSIR - we have a session");
        oktaAuthClient.tokenManager.get('access_token') //This will either get a token and refresh if it needs to or no token
        .then(function(token) {
            handleGetTokenResponse(token);
        })
        .catch(function(err){
            reportLoginStatus(false); //I have no idea what happened
            console.error(err);
        });
    }
    else{
        console.log("NOSIR - no session");
        reportLoginStatus(false);
    }
});

function handleGetTokenResponse(token) {
    if (token) {
        console.log("We got a token.");
        reportLoginStatus(true);
    }
    else {
        console.log("No Token.");
        oktaAuthClient.token.getWithoutPrompt({
            scopes: ['openid', 'profile', 'email'],
            responseType: ['id_token', 'token']
        })
        .then(function(tokens) {
            //Store the tokens in the token manager
            oktaAuthClient.tokenManager.add('id_token', tokens[0]);
            oktaAuthClient.tokenManager.add('access_token', tokens[1]);

            reportLoginStatus(true);
        })
        .catch(function(err) {
            //Assume session is expired, invalid, or does not exist. Redirect to sign-in page.
            console.log("NOSIR - no session");
            reportLoginStatus(false);
        });
    }
}

function reportLoginStatus(loggedIn){
    toggleLoginButton(loggedIn);
    toggleLoggedInText(loggedIn)
}

function toggleLoginButton(loggedIn){
    var loginButton = document.getElementById("loginButton");

    if (loggedIn){
        loginButton.style.display = 'none';
    }
    else{
        loginButton.style.display = 'block';
    }
} 

function toggleLoggedInText(loggedIn){
    var loginStatus = document.getElementById("loginStatus");

    if (loggedIn) {
        loginStatus.textContent = "You are Logged In";
    }
    else{
        loginStatus.textContent = "You are NOT Logged In";
    }
    
}

function loginButtonClicked(){
    console.log("Yea i know you are clicking the login button");
    window.location.href = "http://localhost:8000/signin.html?redirect_url=" + encodeURIComponent("http://localhost:8000/index.html?testarg=55&anotherarg=56&onemore=57");
}