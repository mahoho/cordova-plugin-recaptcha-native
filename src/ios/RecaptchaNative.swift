import Foundation
import RecaptchaEnterprise

@available(iOS 13.0.0, *)
@objc(RecaptchaNative) class RecaptchaNative: CDVPlugin {
  var client: RecaptchaClient?
  
  @objc(verify:)
  func verify(command: CDVInvokedUrlCommand) {
    let callbackId = command.callbackId!

    Task {
      await self.initializeWithFetchClient(callbackId: callbackId)
      
      // Ensure that the client is initialized before calling getToken.
      guard self.client != nil else {
        self.sendError(callbackId, message: "Failed to initialize recaptcha client.")
          return
      }
      
      self.getToken(callbackId: callbackId)
    }
  }
  
  func initializeWithFetchClient(callbackId: String) async {
    guard let viewController = self.viewController as? CDVViewController,
          let siteKey = await viewController.settings["ios_site_key"] as? String, !siteKey.isEmpty else {
      sendError(callbackId, message: "IOS_SITE_KEY not provided in config.xml")
        return
    }
    
    do {
      self.client = try await Recaptcha.fetchClient(withSiteKey: siteKey)
    } catch {
      var errorMessage = "Unknown error"
      let nsError = error as NSError
      errorMessage = nsError.localizedDescription
      self.sendError(callbackId, message: errorMessage)
    }
  
  }
  
  func getToken(callbackId: String) {
    self.client!.execute(withAction: RecaptchaAction.login) { token, error in
        if let token = token {
          self.sendSuccess(callbackId, data: ["token": token])
        } else {
          var errorMessage = "Unknown error"
          let nsError = error! as NSError
          errorMessage = nsError.localizedDescription
          self.sendError(callbackId, message: errorMessage)
        }
    }
  }

  func sendError(_ callbackId: String, message: String) {
        let result = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: message)
        self.commandDelegate.send(result, callbackId: callbackId)
    }

    func sendSuccess(_ callbackId: String, data: [String: Any]) {
        let result = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: data)
        self.commandDelegate.send(result, callbackId: callbackId)
    }
}
