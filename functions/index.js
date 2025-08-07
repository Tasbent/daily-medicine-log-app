const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

exports.getFirebaseConfig = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // It's recommended to store these values in environment variables
    // and access them with process.env
    // For this example, I'm using functions.config(), which is a common
    // way to handle this in Firebase Functions.
    if (!functions.config().sdk) {
        return response.status(500).send("Firebase SDK config not set.");
    }
    const firebaseConfig = {
      apiKey: functions.config().sdk.apikey,
      authDomain: functions.config().sdk.authdomain,
      databaseURL: functions.config().sdk.databaseurl,
      projectId: functions.config().sdk.projectid,
      storageBucket: functions.config().sdk.storagebucket,
      messagingSenderId: functions.config().sdk.messagingsenderid,
      appId: functions.config().sdk.appid
    };
    response.send(firebaseConfig);
  });
});
