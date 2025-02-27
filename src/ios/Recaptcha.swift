import Foundation
import GoogleReCaptchaEnterprise

@objc(Recaptcha) class Recaptcha: CDVPlugin {
    var callbackId: String?

    @objc(verify:)
    func verify(command: CDVInvokedUrlCommand) {
        self.callbackId = command.callbackId

        guard let siteKey = command.arguments[0] as? String else {
            sendError("Site key missing")
            return
        }

        // Use the native reCAPTCHA Enterprise SDK for iOS.
        let recaptchaClient = GRecaptchaEnterprise.sharedInstance()
        recaptchaClient.verify(withSiteKey: siteKey) { token, error in
            if let error = error {
                self.sendError("reCAPTCHA verification failed: \(error.localizedDescription)")
                return
            }
            guard let recaptchaToken = token, !recaptchaToken.isEmpty else {
                self.sendError("Empty reCAPTCHA token")
                return
            }
            // Return the token in a JSON object.
            self.sendSuccess(["recaptchaToken": recaptchaToken])
        }
    }

    func sendError(_ message: String) {
        let result = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: message)
        self.commandDelegate.send(result, callbackId: self.callbackId)
    }

    func sendSuccess(_ data: [String: Any]) {
        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: data)
        self.commandDelegate.send(result, callbackId: self.callbackId)
    }
}

