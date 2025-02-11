// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

let timerInterval;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "startTimer") {
    let endTime = Date.now() + request.duration * 60000; // Convert minutes to milliseconds
    sendResponse({ endTime });

    // Force fullscreen
    chrome.windows.getCurrent({}, (window) => {
      chrome.windows.update(window.id, { state: "fullscreen" });
    });

    // Start the countdown timer
    timerInterval = setInterval(() => {
      let timeLeft = endTime - Date.now();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        chrome.runtime.sendMessage({ command: "timerEnded" });
      } else {
        chrome.runtime.sendMessage({ command: "updateTimer", timeLeft });
      }
    }, 1000);
  }
});
