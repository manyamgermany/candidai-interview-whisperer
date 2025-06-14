
/// <reference path="./chrome.d.ts" />

// Global type extensions
declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

export {};
