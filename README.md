# Cordova Recapatcha Native Plugin
This is a solution for using Google Recaptcha Enterprise to protect you APIs from bots.

## Installation

```
cordova plugin add cordova-plugin-recaptcha-native
```

Add following to your config.xml:

```
<preference name="ANDROID_SITE_KEY" value="your android key from Google Cloud Console" />
<preference name="IOS_SITE_KEY" value="your ios key from Google Cloud Console" />
```

## Usage

```
cordova.plugins.recaptcha.verify(successCallback, errorCallback);
```

`successCallback` receives one argument with a format of: 
```
 {
    "token": "recaptcha response token. could be very long"
 }
```

```
let captchaResponse = await cordova.plugins.recaptcha.verify(() => {}, r => {
   alert(`Token error: ${r}`)
});

let recaptchaToken = captchaResponse.token
```

For backend part consult Google Recaptcha docs and samples based on the language of your choice.
