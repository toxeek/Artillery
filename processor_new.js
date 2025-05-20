'use strict';

module.exports = {
  generateRandomData: generateRandomData,
  setJSONBody: setJSONBody
  // refreshVirtualUserToken: refreshVirtualUserToken,
  // afterScenarioHandler: afterScenarioHandler
};

// Make sure to "npm install" first, all about it in the README.md
const Faker = require('faker');
// const axios = require('axios');
const Req = require('request')
// we initialise dotenv config
require('dotenv').config();

// functions
// fingerprint for custom Artillery function: func(context, ee, next)
function generateRandomData(userContext, events, done) {
    // generate data with Faker:
    const name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
    const email = Faker.internet.exampleEmail().toLowerCase();
    const password = 'testing';
    const phone = Faker.phone.phoneNumber('+4478########');
    const displayName = `${Faker.name.firstName()} ${Faker.name.lastName()}`;

    let idToken = null;
    let useruid = null;
    let refreshToken = null;

    let optionsCreateUser = {
      uri: 'http://localhost:3001/users',
      method: 'POST',
      json: {
          email: email,
          emailVerified: true,
          phoneNumber: phone,
          password: 'testing',
          displayName: displayName
      }
    };

    let optionsSigninUser = {
      uri: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+process.env.FIREBASE_API_TOKEN,
      method: 'POST',
      json: {
          email: email,
          // emailVerified: true,
          // phoneNumber: phone,
          password: 'testing',
          returnSecureToken: true,
          // displayName: displayName
      }
    };

    Req(optionsCreateUser, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            useruid = response.body.uid;
            console.log('[+] user '+ name + ' created with uid: '+ useruid) // +', response: '+ JSON.stringify(response));
        }
    });

    function nestedSignIn() {
      Req(optionsSigninUser, function (error, response, body) {
          console.log('[+] signing in user '+ name + ' ..')
            if (!error) {
                idToken = response.body.idToken;
                console.log('[+] user '+ name + ' signed in with id token: '+ idToken) // +', response: '+ JSON.stringify(response));
            }
            else {
              console.log('[+] error signing in user '+ name + ': '+JSON.stringify(error));
            }
      });
    }

    setTimeout(nestedSignIn, 3000);

}

// called on beforeRequest hook
function setJSONBody(requestParams, userContext, ee, next) {
  // requestParams.uri = 'https://hj-test-api.democompanydev.com';
  // requestParams.json = {"query":"{    id,    emailAddress,    emailVerified    phoneNumber    wallet {        id    }    legalProfile {        kycStatus    }}","variables":{}}
  function setRequestParams() {
    requestParams.json = JSON.stringify({
      query: '{    id,    emailAddress,    emailVerified    phoneNumber    wallet {        id    }    legalProfile {        kycStatus    }}',
      variables: {}
    });

    requestParams.headers.Authentication = "Bearer "+userContext.vars.idToken
  }

  setTimeout(setRequestParams, 3000);

  return next(); // MUST be called for the scenario to continue
}

// fingerprint for afterscenario Artillery function: func(context, ee, next)
// function afterScenarioHandler(userContext, ee, done) {
//     // deletes user from Firebase backend
//   console.log('[+] deleting user with uid: '+userContext.vars.useruid);
//   axios.delete('http://localhost:3001/users/'+userContext.vars.useruid)
//       .then(function(userdeleted) {
//         console.log('[+] user with uid ' + userContext.vars.useruid +' deleted successfully')
//       })
//       .catch((err) => {
//         console.log(err.message);
//   });

//   return done();

// }

/** we get a 403 Forbidden, race condition most probably **/
// fingerprint for beforescenario Artillery function: func(context, ee, next)
// async function refreshVirtualUserToken(requestParams, userContext, ee, next) {
//     console.log('[+] refreshing token for user '+userContext.vars.name);
//     const data = qs.stringify({
//       grant_type: 'refresh_token',
//       refresh_token: userContext.vars.refreshToken
//     });
    
//     const headers = {
//       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
//     };
//     await axios.post(
//       'https://securetoken.googleapis.com/v1/token',
//       data,
//        headers
//       )
//       .then(result => { console.log('[+] refreshed token for user '+ userContext.vars.name +' successful')
//       })
//       .catch((err) => {
//         console.log(err.message);
//       }); 
        
//     return next();
  
//   }


