package com.example.recaptcha;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

import ua.poezd.app.MainActivity;

public class RecaptchaNative extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("verify".equals(action)) {
            verifyToken(callbackContext);
            return true;
        }
        return false;
    }

    private void verifyToken(CallbackContext callbackContext) {
        final MainActivity activity = (MainActivity)cordova.getActivity();
        activity.getRecaptchaToken(callbackContext);
    }
}
