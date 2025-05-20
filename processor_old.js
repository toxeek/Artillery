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
  generateRandomData: generateRandomData
  // cleanupUserData: cleanupUserData
};

// Make sure to "npm install" first, all about it in the README.md
const Faker = require('faker');
const axios = require('axios');
// we initialise dotenv config
require('dotenv').config();

// functions 
function generateRandomData(userContext, events, done) {
  // generate data with Faker:
  const name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
  const email = Faker.internet.exampleEmail().toLowerCase(); //.replace(/@.*/, "@cdemocompany.com");
  const password = 'testing';
  const phone = Faker.phone.phoneNumber('+4478########');
  const displayName = 'Integration Tester';

  axios.post('http://localhost:3001/users', {
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
  .then(
    ([responseCreateUser,responseSigninUser]) => {
      console.log(responseCreateUser.response.data,responseSigninUser.response.data);
    })
  .catch((err) => {
      console.log(err.message);
  });

// add variables to virtual user's context:
  userContext.vars.name = name;
  userContext.vars.email = email;
  userContext.vars.phone = phone;
  userContext.vars.displayName = displayName;
  userContext.vars.password = password;
  userContext.vars.idToken = idToken;
  // continue with executing the scenario:
  return done();
  }