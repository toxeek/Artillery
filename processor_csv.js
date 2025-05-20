'use strict';

module.exports = {
  beforeScenarioHandler: beforeScenarioHandler,
  afterScenarioHandler: afterScenarioHandler
};

// functions
// fingerprint for beforeRequest Artillery handler function: func(requestParams, context, ee, next)
function beforeScenarioHandler(requestParams, context, ee, next) {

  function makeDeviceId(length) {
      var result           = '';
      var characters       = 'abcdefg0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
  }

  function makeRegistrationToken(length,length2,length3,length4,length5,length6,length7,length8,length9) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += ':';
    for ( var i = 0; i < length2; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
    for ( var i = 0; i < length3; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
    for ( var i = 0; i < length4; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
    for ( var i = 0; i < length5; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
    for ( var i = 0; i < length6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
    for ( var i = 0; i < length7; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '_';
    for ( var i = 0; i < length8; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += '-';
    for ( var i = 0; i < length9; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }


    return result;
}

  const deviceid = makeDeviceId(16);
  const fcmRegistrationToken = makeRegistrationToken(10,10,9,5,5,21,26,8,57);

  const graphqr = '{\"query\": \"mutation MutationRegisterDevice {registerDevice(request: {deviceId:\"'+deviceid+'\",fcmRegistrationToken:\"'+fcmRegistrationToken+'\"})}}';
    // {
    //   "query": "mutation MutationRegisterDevice {registerDevice(request: {deviceId:\"9298a5995e9593f4\",fcmRegistrationToken:\"fEy6QP4hRU-PWRjocJbrDO:APA91bHwt-p9X7O-OQJGb-5UqeC1HrnkHLzASljVebF-wv6qBG8VH8uJMNVNPqIqJ7XYtk1_oAOvnRys-CzbHKepHb095bgY5K8bf4nAETVgMFZdQx3DVrkjWhypxOkHWreulxv7B4WS\"}){... on DeviceSettings{deviceId, fcmRegistrationToken}}}",
    //   "operationName": "MutationRegisterDevice"
    // }

    "{ \"query\": \"{  c_con_tic_PTF(docmanId: 123, dz: CR) { docmanId, dz, data }}\" }"

  // const qr = JSON.stringify(graphqr);

  requestParams.json = graphqr;

  // we keep on with the scenario
  return next();

}

function afterScenarioHandler(requestParams, response, context, ee, next) {
  console.log(response.headers);

  return next(); // MUST be called for the scenario to continue

}
