#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Get project root from context
module.exports = function (context) {
  const projectRoot = context.opts.projectRoot
  const androidMainPath = path.join(projectRoot, 'platforms/android/app/src/main/java')
  const mainActivityPath = findMainActivity(androidMainPath)

  if (mainActivityPath) {
    let content = fs.readFileSync(mainActivityPath, 'utf8')

    const requiredImports = [
      'import androidx.annotation.NonNull;',
      'import androidx.annotation.Nullable;',
      'import com.google.android.gms.tasks.OnFailureListener;',
      'import com.google.android.gms.tasks.OnSuccessListener;',
      'import com.google.android.recaptcha.Recaptcha;',
      'import com.google.android.recaptcha.RecaptchaTasksClient;',
    ]

    content = addImports(content, requiredImports)

    if (content.indexOf('/* Recaptcha Native Code Start */') === -1) {
      content = content.replace(/(}\s*)$/, `
    /* Recaptcha Native Code Start */
    @Nullable
    private RecaptchaTasksClient recaptchaTasksClient = null;

    private void initializeRecaptchaClient() {
        String key = preferences.getString("ANDROID_SITE_KEY", "");
        Recaptcha.fetchTaskClient(getApplication(), key)
                .addOnSuccessListener(
                        this,
                        new OnSuccessListener<RecaptchaTasksClient>() {
                            @Override
                            public void onSuccess(RecaptchaTasksClient client) {
                                MainActivity.this.recaptchaTasksClient = client;
                            }
                        })
                .addOnFailureListener(
                        this,
                        new OnFailureListener() {
                            @Override
                            public void onFailure(@NonNull Exception e) {
                                // Handle errors ...
                                // See "Handle errors" section
                            }
                        });
    }

    public void getRecaptchaToken(CallbackContext callbackContext) {
        recaptchaTasksClient
                .executeTask(RecaptchaAction.LOGIN)
                .addOnSuccessListener(
                        this,
                        new OnSuccessListener<String>() {
                            @Override
                            public void onSuccess(String token) {
                                if (token != null && !token.isEmpty()) {
                                    JSONObject result = new JSONObject();
                                    try {
                                        result.put("token", token);
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
                .addOnFailureListener(
                        this,
                        new OnFailureListener() {
                            @Override
                            public void onFailure(@NonNull Exception e) {
                                callbackContext.error("Token fetch failed: " + e.getMessage());
                            }
                        });
    }
    /* Recaptcha Native Code End */
$1`);

    if (content.indexOf('initializeRecaptchaClient();') === -1) {
        // Regex to match the onCreate method.
        // This captures: (1) the method declaration and opening brace, (2) the body, and (3) the closing brace.
        const onCreateRegex = /((public|protected)\s+void\s+onCreate\s*\([^)]*\)\s*\{)([\s\S]*?)(^\s*\})/m
        const match = content.match(onCreateRegex)
        if (match) {
          const methodStart = match[1]  // e.g., public void onCreate(...){
          const methodBody = match[3]   // current content inside onCreate
          const methodClosing = match[4]  // the closing brace of onCreate

          // Append the initializeRecaptchaClient(); call before the closing brace.
          const newMethodBody = methodBody + '\n        initializeRecaptchaClient();\n'
          const newOnCreate = methodStart + newMethodBody + methodClosing
          content = content.replace(onCreateRegex, newOnCreate)
          console.log('initializeRecaptchaClient(); added to onCreate in MainActivity.')
        } else {
          console.warn('onCreate method not found in MainActivity.')
        }

        fs.writeFileSync(mainActivityPath, content, 'utf8')
        console.log('MainActivity modified successfully by the plugin hook.')
      } else {
        console.log('Custom code already exists in MainActivity.')
      }
    } else {
      console.warn('MainActivity.java not found. Please verify your Android project structure.')
    }
  }
  

  /**
   * Adds import statements right after the package declaration if they are not already present.
   */
  function addImports(content, imports) {
    // Find package declaration (e.g., "package com.example.app;")
    const packageMatch = content.match(/package\s+[\w\.]+;\s*/)
    if (packageMatch) {
      const packageEnd = packageMatch[0].length
      let importStr = ''
      imports.forEach(imp => {
        if (content.indexOf(imp) === -1) {  // Only add if missing.
          importStr += imp + '\n'
        }
      })
      if (importStr) {
        content = content.slice(0, packageEnd) + '\n' + importStr + content.slice(packageEnd)
      }
    }
    return content
  }

// Recursive function to find MainActivity.java in the given directory
  function findMainActivity(dir) {
    const files = fs.readdirSync(dir)
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dir, files[i])
      if (fs.statSync(filePath).isDirectory()) {
        const found = findMainActivity(filePath)
        if (found) return found
      } else if (filePath.endsWith('MainActivity.java')) {
        return filePath
      }
    }
    return null
  }
}