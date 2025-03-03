import Foundation
import RecaptchaEnterprise

@available(iOS 13.0.0, *)
@objc(RecaptchaNative) class RecaptchaNative: CDVPlugin {
  var callbackId: String?
  var client: RecaptchaClient?
  
  @objc(verify:)
  func verify(command: CDVInvokedUrlCommand) {
    self.callbackId = command.callbackId

    Task {
      await self.initializeWithFetchClient()
      
      // Ensure that the client is initialized before calling getToken.
      guard self.client != nil else {
          self.sendError("Failed to initialize recaptcha client.")
          return
      }
      
      self.getToken()
    }
  }
  
  func initializeWithFetchClient() async {
    guard let viewController = self.viewController as? CDVViewController,
          let siteKey = viewController.settings["ios_site_key"] as? String, !siteKey.isEmpty else {
        sendError("IOS_SITE_KEY not provided in config.xml")
        return
    }
    
    do {
      self.client = try await Recaptcha.fetchClient(withSiteKey: siteKey)
    } catch {
      var errorMessage = "Unknown error"
      if let nsError = error as? NSError {
          errorMessage = nsError.localizedDescription
      } else if let errorStr = error as? String {
          errorMessage = errorStr
      }
      self.sendError(errorMessage)
    }
  
  }
  
  func getToken() {
    self.client!.execute(withAction: RecaptchaAction.login) { token, error in
        if let token = token {
            self.sendSuccess(["token": token])
        } else {
            var errorMessage = "Unknown error"
            if let nsError = error as? NSError {
                errorMessage = nsError.localizedDescription
            } else if let errorStr = error as? String {
                errorMessage = errorStr
            }
            self.sendError(errorMessage)
        }
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
