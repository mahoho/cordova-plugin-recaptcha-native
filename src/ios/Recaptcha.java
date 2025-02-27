package com.example.recaptcha;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import com.google.android.gms.recaptcha.Recaptcha;
import com.google.android.gms.recaptcha.RecaptchaClient;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.OnFailureListener;

public class Recaptcha extends CordovaPlugin {
    private CallbackContext callbackContext;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("verify".equals(action)) {
            String siteKey = args.getString(0);
            this.callbackContext = callbackContext;
            verifyRecaptcha(siteKey);
            return true;
        }
        return false;
    }

    private void verifyRecaptcha(String siteKey) {
        final Activity activity = cordova.getActivity();

        // Obtain an instance of the official reCAPTCHA client.
        RecaptchaClient recaptchaClient = Recaptcha.getClient(activity);
        recaptchaClient.verifyWithRecaptcha(siteKey)
            .addOnSuccessListener(activity, new OnSuccessListener<String>() {
                @Override
                public void onSuccess(String token) {
                    if (token != null && !token.isEmpty()) {
                        JSONObject result = new JSONObject();
                        try {
                            result.put("recaptchaToken", token);
                        } catch (JSONException e) {
                            callbackContext.error("JSON error: " + e.getMessage());
                            return;
                        }
                        callbackContext.success(result);
                    } else {
                        callbackContext.error("Empty token received");
                    }
                }
            })
            .addOnFailureListener(activity, new OnFailureListener() {
                @Override
                public void onFailure(Exception e) {
                    callbackContext.error("reCAPTCHA verification failed: " + e.getMessage());
                }
            });
    }
}

