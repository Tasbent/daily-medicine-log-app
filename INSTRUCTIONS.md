# Instructions for setting up Firebase environment variables

To securely manage your Firebase API keys, you need to set them as environment variables for your Firebase Functions. This ensures that your keys are not exposed in your client-side code.

## 1. Set the Firebase SDK configuration

You need to set the following environment variables for your Firebase project:

- `sdk.apikey`
- `sdk.authdomain`
- `sdk.databaseurl`
- `sdk.projectid`
- `sdk.storagebucket`
- `sdk.messagingsenderid`
- `sdk.appid`

You can set these variables using the Firebase CLI. For example, to set the `apiKey`, you would run the following command:

```bash
firebase functions:config:set sdk.apikey="YOUR_API_KEY"
```

You need to do this for all the keys in your `firebaseConfig` object.

**Example:**

```bash
firebase functions:config:set sdk.apikey="AIzaSy...9TM"
firebase functions:config:set sdk.authdomain="your-project.firebaseapp.com"
firebase functions:config:set sdk.databaseurl="https://your-project.firebaseio.com"
firebase functions:config:set sdk.projectid="your-project"
firebase functions:config:set sdk.storagebucket="your-project.appspot.com"
firebase functions:config:set sdk.messagingsenderid="1234567890"
firebase functions:config:set sdk.appid="1:1234567890:web:1234567890abcdef"
```

## 2. Deploy your functions

After setting the environment variables, you need to deploy your functions:

```bash
firebase deploy --only functions
```

## 3. Deploy your hosting

Finally, deploy your hosting to make the changes live:

```bash
firebase deploy --only hosting
```

After following these steps, your application will securely fetch the Firebase configuration from your Firebase Function, and your API keys will no longer be exposed in your client-side code.
