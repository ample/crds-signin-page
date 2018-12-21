# crds-signin-page
Sign in page for Crossroads

### Netlify

This is hosted on netlify under development.signin.crossroads.net for now

### Running Local

Make a copy of the example.env file and name it .env. Change any variables you'd like.

Then run:
`npm i`
`npm start`

Navigate to http://localhost:8000/loginstatus.html - This page contains logic to check your login status and you can click the login button from there

SignIn on http://localhost:8000/index.html - This contains all the signin logic

### Notes
The sign in page (index) is quality code and has unit tests supporting it.

The login page (longstatus) is example code and is meant to show the authentication flow that needs to be performed in a standalone application.