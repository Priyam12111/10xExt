chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: "popup.html",
    type: "popup",
    width: 800,
    height: 600,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js", "sendMail.js", "connectSheet.js"],
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "authenticate") {
    authenticateWithGoogle(message.sender);
  }
});

function authenticateWithGoogle(sender) {
  const clientId =
    "196149102149-bncutk5her237nmbikbiuhp72enlfilr.apps.googleusercontent.com";
  const redirectUri =
    "https://klbflhgmkohpdgobojmenojiapdogbgi.chromiumapp.org/";

  const scopes = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/spreadsheets",
  ].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    (redirectUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error during authentication:", chrome.runtime.lastError);
        return;
      }

      const urlParams = new URLSearchParams(new URL(redirectUrl).search);
      const authCode = urlParams.get("code");

      if (authCode) {
        sendAuthCodeToBackend(authCode, sender);
      } else {
        console.error("No authorization code found.");
      }
    }
  );
}

function sendAuthCodeToBackend(authCode, sender) {
  fetch("http://localhost:5000/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: authCode, sender: sender }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Backend Error:", data.error);
      } else {
        console.log("Backend Response:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error sending auth code to backend:", error);
    });
}
