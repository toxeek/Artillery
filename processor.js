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
  getIdTokenFunction: getIdTokenFunction,
  beforeRequestHandler: beforeRequestHandler,
  afterResponseHandler: afterResponseHandler
  // cleanupUserData: cleanupUserData
};

// Make sure to "npm install" first, all about it in the README.md
const Faker = require('faker');
const axios = require('axios');
// we initialise dotenv config
require('dotenv').config();

// we make email and password vars globals
let email;
let password = 'testing';

// functions 
// fingerprint for beforeRequest handler function: func(context, ee, next)
function generateRandomData(context, ee, next) {
  // generate data with Faker:
  let name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
  email = Faker.internet.exampleEmail().toLowerCase();
  let phone = Faker.phone.phoneNumber('+4478########');
  let displayName = 'Integration Tester';
  // const refreshToken = undefined;
  // const idToken = undefined;

  console.log('[+] creating user '+name);

  axios.post('http://localhost:3001/users', {
      email: email,
      emailVerified: true,
      phoneNumber: phone,
      password: password,
      displayName: displayName
  });

  console.log('[+] user '+name + ' created');
// add variables to virtual user's context:
  context.vars.name = name;
  context.vars.email = email;
  context.vars.phone = phone;
  context.vars.displayName = displayName;
  context.vars.password = password;

  return next(); // MUST be called to return to scenario

}

// fingerprint for custom Artillery function: func(context, events, done)
// to be hooked on: beforeRequest
function getIdTokenFunction(context, events, done) {
  let contentdata = [];
  // let reqEmail    = context.vars.email;
  // let reqPassword = context.vars.password;
  let name        = context.vars.name;

  console.log('[+] Entering getIdToken with name '+name+ ' email '+context.vars.email+ ' and passwrod '+context.vars.password);

  axios.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+process.env.FIREBASE_API_TOKEN, {
    email: context.vars.email,
    password: context.vars.password,
    returnSecureToken: true
  })
  // .then(function(reqResponse) {
  //   const newLocal = JSON.stringify(reqResponse);
  //   console.log('[+] inside then() ...');
  //   console.log('[+] JSON stringify data: '+newLocal);
  //   contentdata.push(reqReponse.data);
  // })
  // .catch(err => {
  //   console.log(JSON.stringify(err));
  // });

    // contentdata.push(values.data.idToken);
    // contentdata.push(values.data.refreshToken);

  // context.vars.idToken = contentdata[0].data.idToken; 
  // context.vars.refreshToken = contentdata[0].data.refreshToken;
  // console.log('[+] debugging returned data: '+contentdata);

  // console.log(res.data);

  return done(); // MUST be called to return to scenario

}

// fingerprint for beforeRequest handler function: func(requestParams, context, ee, next)
function beforeRequestHandler(requestParams, context, ee, next) {
  // Call your OAuth client, and after you obtain token you can assign it to requestParams Authorization header
  // eg. requestParams.headers.Authorization = `Bearer + ${token}`
  // ref: https://stackoverflow.com/questions/58712212/how-to-automate-the-oauth-2-0-token-generation-using-artillery
  requestParams.headers.Authorization = 'Bearer '+ context.vars.idToken;

  return next(); // MUST be called to return to scenario

}

// fingerprint for afterResponse handler function: func(context, events, done)
function afterResponseHandler(requestParams, response, context, ee, next) {
  console.log('we received a response body: '+response.headers.authorization);

  return next(); // MUST be called to return to scenario

}