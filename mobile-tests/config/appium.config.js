export const appiumConfig = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: {
    android: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator (Pixel 7 / 390x844)',
      'appium:appPackage': 'com.smarttable.app',
      'appium:appActivity': 'com.smarttable.app.MainActivity',
      'appium:noReset': true,
      'appium:newCommandTimeout': 3600,
      'appium:autoGrantPermissions': true,
      'appium:chromedriverAutodownload': true
    },
    ios: {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': 'iPhone 14 (390x844)',
      'appium:bundleId': 'com.smarttable.app',
      'appium:noReset': true
    },
    mobileWeb: {
      browserName: 'Chrome',
      'goog:chromeOptions': {
        mobileEmulation: {
          deviceName: 'iPhone 14 / Pixel 7 (390x844)'
        },
        args: ['--headless=new', '--no-sandbox', '--disable-gpu']
      }
    }
  },
  timeouts: {
    implicit: 5000,
    pageLoad: 15000,
    script: 10000
  },
  baseUrl: 'http://localhost:5173'
};
