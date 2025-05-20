/*** the generateRandomData() function needs to be atomic, as artillery will create n users and we need to:
 * 1/ create the user
 * 2/ sign the user in
 * 3/ get the token that artillery will use for subsequent requests using that user's token as an Auth header
 * 
 * Given the nature of the load test, we need to exit promptly if the user has already been created, and use the token generated at sign in
 * time, for that artillery flow. 
 * we aim to set a `userContext.vars` holding the users token
 ***/

'use strict';

module.exports = {
  generateRandomData: generateRandomData,
  afterScenarioHandler: afterScenarioHandler
};

// Make sure to "npm install" first, all about it in the README.md
const Faker = require('faker');
const axios = require('axios');
// we initialise dotenv config
require('dotenv').config();

// functions
// fingerprint for custom Artillery function: func(context, ee, next)
async function generateRandomData(userContext, events, done) {
  // generate data with Faker:
  const name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
  const email = Faker.internet.exampleEmail().toLowerCase();
  const password = 'testing';
  const phone = Faker.phone.phoneNumber('+4478########');
  const displayName = `${Faker.name.firstName()} ${Faker.name.lastName()}`;

  let idToken = null;
  let useruid = null;
  let refreshToken = null;

  function setIdToken(responseCreateUser,responseSigninUser) {
    useruid = responseCreateUser.data.uid;
    idToken = responseSigninUser.data.idToken;
    refreshToken = responseSigninUser.data.refreshToken;
    console.log('user '+ name + ' uid: ',responseCreateUser.data.uid,responseCreateUser.status);
    console.log('user '+ name + ' idToken: ',responseSigninUser.data.idToken,responseSigninUser.status);
    console.log('user '+ name + ' refreshToken: ',responseSigninUser.data.refreshToken,responseSigninUser.status);
  }

  await axios.post('http://localhost:3001/users', {
      email: email,
      emailVerified: true,
      phoneNumber: phone,
      password: 'testing',
      displayName: displayName
    })
    .then(
      responseCreateUser =>
        Promise.all([
          responseCreateUser,
          axios.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+process.env.FIREBASE_API_TOKEN, {
            email: email,
            password: password,
            returnSecureToken: true
          })
      ])
    ) 
    .then (values => setIdToken(values[0],values[1]));

// add variables to virtual user's context:
  userContext.vars.name = name;
  userContext.vars.email = email;
  userContext.vars.phone = phone;
  userContext.vars.displayName = displayName;
  userContext.vars.password = password;
  userContext.vars.useruid = useruid;
  userContext.vars.idToken = idToken;
  userContext.vars.refreshToken = refreshToken;
// continue with executing the scenario:
  console.log('[+] Executing scenario ..')
  
  if (userContext.vars.idToken) {
    return done();
  }

  }

// fingerprint for afterscenario Artillery function: func(context, ee, next)
function afterScenarioHandler(userContext, ee, done) {
    // deletes user from Firebase backend
  console.log('[+] deleting user with uid: '+userContext.vars.useruid);
  axios.delete('http://localhost:3001/users/'+userContext.vars.useruid)
      .then(function(userdeleted) {
        console.log('[+] user with uid ' + userContext.vars.useruid +' deleted successfully')
      })
      .catch((err) => {
        console.log(err.message);
  });

  return done();

}



