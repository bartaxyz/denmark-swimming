const fs = require("fs");
const path = require("path");
const {
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject,
} = require("@expo/config-plugins");
const {
  addBuildSourceFileToGroup,
  getApplicationNativeTarget,
} = require("@expo/config-plugins/build/ios/utils/Xcodeproj");

const SCENE_CONFIGURATION_NAME = "Default Configuration";
const SCENE_DELEGATE_FILE = "SceneDelegate.swift";

const sceneDelegateSource = `import UIKit
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    if let appDelegate = UIApplication.shared.delegate as? AppDelegate,
       let factory = appDelegate.reactNativeFactory {
      factory.startReactNative(
        withModuleName: "main",
        in: window,
        launchOptions: nil
      )
    }
  }
}
`;

function withIosSceneLifecycle(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: SCENE_CONFIGURATION_NAME,
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };

    return config;
  });

  config = withAppDelegate(config, (config) => {
    if (config.modResults.language !== "swift") {
      throw new Error("withIosSceneLifecycle only supports Swift AppDelegate files.");
    }

    let contents = config.modResults.contents;

    const legacyBootstrap = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

    const sceneBootstrap = `#if os(iOS)
    // React Native is started from SceneDelegate when using the UIKit scene lifecycle.
#elseif os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

    if (contents.includes(legacyBootstrap)) {
      contents = contents.replace(legacyBootstrap, sceneBootstrap);
    }

    const configurationMethod = `
#if os(iOS)
  public func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    return UISceneConfiguration(name: "${SCENE_CONFIGURATION_NAME}", sessionRole: connectingSceneSession.role)
  }
#endif
`;

    if (!contents.includes("configurationForConnecting connectingSceneSession")) {
      contents = contents.replace("\n  // Linking API", `${configurationMethod}\n  // Linking API`);
    }

    config.modResults.contents = contents;
    return config;
  });

  config = withDangerousMod(config, ["ios", async (config) => {
    const projectName = config.modRequest.projectName;
    const sceneDelegatePath = path.join(
      config.modRequest.platformProjectRoot,
      projectName,
      SCENE_DELEGATE_FILE
    );

    fs.writeFileSync(sceneDelegatePath, sceneDelegateSource);

    return config;
  }]);

  config = withXcodeProject(config, (config) => {
    const projectName = config.modRequest.projectName;
    const target = getApplicationNativeTarget({
      project: config.modResults,
      projectName,
    });

    addBuildSourceFileToGroup({
      filepath: `${projectName}/${SCENE_DELEGATE_FILE}`,
      groupName: projectName,
      project: config.modResults,
      targetUuid: target.uuid,
    });

    return config;
  });

  return config;
}

module.exports = withIosSceneLifecycle;
