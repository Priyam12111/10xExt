console.log("Executing Sheet Script");
async function createSheetList() {
  const sheetListContainer = document.createElement("div");
  sheetListContainer.className = "sheet-list-container hidden";
  const sheetListHtmlUrl = chrome.runtime.getURL("assets/html/sheetlist.html");

  try {
    const response = await fetch(sheetListHtmlUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch sheet list HTML: ${response.statusText}`
      );
    }
    const html = await response.text();
    sheetListContainer.innerHTML = html;
    document.body.appendChild(sheetListContainer);
  } catch (error) {
    console.error("Error creating sheet list:", error);
  }

  try {
    LoadsheetJS();
  } catch (error) {
    console.error("Error loading sheet list:", error);
  }
}

function createSheetItems(data, parentNode) {
  return data.map((sheet) => {
    let sheetItem = document.createElement("li");
    sheetItem.dataset.id = sheet.id;
    sheetItem.style.display = "flex";
    sheetItem.style.alignItems = "center";
    sheetItem.style.gap = "10px";
    sheetItem.style.padding = "8px";
    sheetItem.style.borderBottom = "1px solid #ddd";

    sheetItem.innerHTML = `
      <img 
        src="https://cdn.gmass.us/img2017/google-sheets.png" 
        alt="Google Sheets Icon" 
        width="50" 
        height="50"
        style="border-radius: 4px;"
      >
      <span style="font-size: 16px; font-weight: 500; color: #333;">
        ${sheet.name}
      </span>
      <span style="font-size: 14px; color: #666; white-space: nowrap; margin-left: auto;">
        Created: ${new Date(sheet.createdTime).toLocaleString()}
      </span>
    `;
    parentNode.appendChild(sheetItem);

    return sheetItem;
  });
}

function createSheetNames(data, parentNode) {
  return data.map((sheet) => {
    let sheetItem = document.createElement("li");
    sheetItem.dataset.id = sheet;
    sheetItem.style.display = "flex";
    sheetItem.style.alignItems = "center";
    sheetItem.style.gap = "10px";
    sheetItem.style.padding = "8px";
    sheetItem.style.borderBottom = "1px solid #ddd";

    sheetItem.innerHTML = `
      <img 
        src="https://cdn.gmass.us/img2017/google-sheets.png" 
        alt="Google Sheets Icon" 
        width="50" 
        height="50"
        style="border-radius: 4px;"
      >
      <span style="font-size: 16px; font-weight: 500; color: #333;">
        ${sheet}
      </span>
    `;
    parentNode.appendChild(sheetItem);

    return sheetItem;
  });
}
async function fetchAndDisplaySheetNames() {
  let sheetNameResponseData;
  try {
    console.log(
      "https://acaderealty.com/get-sheet-names?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender")) +
        "&spreadsheetId=" +
        sessionStorage.getItem("spreadsheetId")
    );
    const sheetNameResponse = await fetch(
      "https://acaderealty.com/get-sheet-names?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender")) +
        "&spreadsheetId=" +
        sessionStorage.getItem("spreadsheetId")
    );
    if (!sheetNameResponse.ok) {
      throw new Error(
        "Sheet Name Network response was not ok " + sheetNameResponse.statusText
      );
    }

    sheetNameResponseData = await sheetNameResponse.json();
  } catch (error) {
    sheetNameResponseData = { sheetNames: ["Sheet1"] };
    console.error("Error fetching sheet names:", error);
  }
  const sheet_dropdown_list = document.querySelector("#sheet-dropdown-list");
  sheet_dropdown_list.innerHTML = "";
  createSheetNames(sheetNameResponseData["sheetNames"], sheet_dropdown_list);
}

async function sheetListJs() {
  try {
    const response = await fetch(
      "https://acaderealty.com/list-sheets?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender")),
      {
        method: "GET",
        headers: {
          "x-api-key": "priyam",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();

    const sheetList = document.querySelector("#dropdown-list");
    sheetList.innerHTML = "";
    createSheetItems(data["result"], sheetList);
  } catch (error) {
    console.error("Error fetching sheet list:", error);
  }
}
function LoadsheetJS() {
  const dropdown = document.getElementById("dropdown");
  const placeholder = document.getElementById("dropdown-placeholder");
  const searchInput = document.getElementById("dropdown-search");
  const dropdownList = document.getElementById("dropdown-list");
  const sheet_dropdown = document.getElementById("sheet-dropdown");
  const sheet_placeholder = document.getElementById(
    "sheet-dropdown-placeholder"
  );
  const sheet_searchInput = document.getElementById("sheet-dropdown-search");
  const sheet_dropdownList = document.getElementById("sheet-dropdown-list");

  sheet_dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    sheet_placeholder.style.display = "none";
    sheet_searchInput.style.display = "flex";
    sheet_searchInput.focus();
    sheet_dropdownList.classList.remove("hidden");
  });

  sheet_searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const listItems = sheet_dropdownList.querySelectorAll("li");
    listItems.forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(searchValue)
        ? "flex"
        : "none";
    });
  });

  sheet_dropdownList.addEventListener("click", (e) => {
    const target = e.target.closest("LI, SPAN");
    SpreadsheetSave.style.display = "block";
    if (target) {
      const selectedItem =
        target.tagName === "SPAN" ? target.parentElement : target;
      console.log("Selected tab:", selectedItem.textContent);
      sheet_placeholder.textContent = selectedItem.textContent;
      sessionStorage.setItem("range", selectedItem.dataset.id);
      sheet_searchInput.value = "";
      sheet_searchInput.style.display = "none";
      sheet_placeholder.style.display = "block";
      sheet_dropdownList.classList.add("hidden");
    }
  });
  const SpreadsheetSave = document.getElementById("SpreadsheetSave");
  const sheetListContainer = document.querySelector(".sheet-list-container");
  const mainContainer = document.querySelector(".main");

  dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    placeholder.style.display = "none";
    searchInput.style.display = "flex";
    searchInput.focus();
    dropdownList.classList.remove("hidden");
    sheet_dropdownList.classList.add("hidden");
  });

  searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const listItems = dropdownList.querySelectorAll("li");
    listItems.forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(searchValue)
        ? "flex"
        : "none";
    });
  });

  closeButton = document.querySelector("#close-btn");
  closeButton.addEventListener("click", () => {
    console.log("Close Button Clicked");
    sheetListContainer.classList.toggle("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
    }
    if (!sheet_dropdown.contains(e.target)) {
      sheet_searchInput.value = "";
      sheet_searchInput.style.display = "none";
      sheet_placeholder.style.display = "block";
      sheet_dropdownList.classList.add("hidden");
    }
  });

  dropdownList.addEventListener("click", (e) => {
    const target = e.target.closest("LI, SPAN");
    if (target) {
      const selectedItem =
        target.tagName === "SPAN" ? target.parentElement : target;
      console.log("Selected sheet:", selectedItem.textContent);
      placeholder.textContent = selectedItem.textContent;
      sessionStorage.setItem(
        "spreadsheetId",
        selectedItem.dataset.id.replace(/[()]/g, "")
      );
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
      dropdownList.classList.add("hidden");
      try {
        fetchAndDisplaySheetNames();
      } catch (error) {
        console.error("Error fetching sheet names:", error);
      }
      sheet_dropdown.classList.remove("hidden");
    }
  });

  SpreadsheetSave.addEventListener("click", () => {
    console.log("Saving...");
    fetch(
      `https://acaderealty.com/create-headers?sender=${sessionStorage.getItem(
        "sender"
      )}&range=${sessionStorage.getItem(
        "range"
      )}&spreadsheetId=${sessionStorage.getItem("spreadsheetId")}&newHeaders=${[
        "Opens",
        "Clicks",
        "Unsubscribed",
        "Bounced",
        "Sent",
        "Replied",
        "Follow 1",
        "Follow 2",
        "Follow 3",
        "Follow 4",
        "Follow 5",
      ]}`,
      {
        method: "GET",
        headers: {
          "x-api-key": "priyam",
          "Content-Type": "application/json",
        },
      }
    ).then((response) => {
      if (response.ok) {
        console.log("Headers created successfully.");
      } else {
        console.error("Failed to create headers:", response.statusText);
      }
    });

    sheetListContainer.classList.add("hidden");

    try {
      const bodyField = document.querySelector(
        ".Am.aiL.Al.editable.LW-avf.tS-tW"
      );
      if (!bodyField) {
        const compose = document.querySelector(".T-I.T-I-KE.L3");
        if (compose) {
          compose.click();
        }
      }

      setTimeout(() => {
        fetchDataFromSheet();
      }, 1000);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  sheetListContainer.addEventListener("click", () => {
    sheetListContainer.classList.toggle("hidden");
  });

  mainContainer.addEventListener("click", (event) => {
    event.stopPropagation();
    // placeholder.textContent = "Select Spreadsheet";
    // sheet_placeholder.textContent = "Select Sheet";
    placeholder.style.display = "block";
    sheet_placeholder.style.display = "block";
    searchInput.style.display = "none";
    sheet_searchInput.style.display = "none";
    dropdownList.classList.add("hidden");
    sheet_dropdownList.classList.add("hidden");
  });
}

async function createSignUp() {
  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modal", "fade", "gMassSec");
  modalContainer.id = "signGmass";
  modalContainer.setAttribute("tabindex", "-1");
  modalContainer.setAttribute("aria-labelledby", "gMasspopSec");
  modalContainer.setAttribute("aria-hidden", "true");

  modalContainer.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content signGmasWidth">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="gMasspopSec"></h1>
        </div>
        <div class="modal-body">
          <div class="gmas-sign">
            <div>
              <img src="https://drkcrypt.github.io/Dropmenu/assets/images/gmass-mailer-logo.svg" alt="gmass mailer" width="288" height="72">
            </div>
            <h3>You must connect MassMailer to your Google account for this to work.</h3>
            <div class="signGoogLink">
              <div class="googleSignsec">
                <img src="https://drkcrypt.github.io/Dropmenu/assets/images/google.svg" alt="gmass mailer" width="48" height="48">
                Sign up with Google
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  document.querySelector(".signGoogLink").addEventListener("click", () => {
    try {
      createMsgBox("Initiating Google Sign-In process...");
      chrome.runtime.sendMessage({
        action: "authenticate",
        sender: sessionStorage.getItem("sender"),
      });
    } catch (error) {
      console.error("Error sending message to background script:", error);
    }

    setTimeout(() => {
      document.querySelector("#signGmass").style.display = "none";
    }, 10000);
  });

  document.querySelector("#signGmass").addEventListener("click", () => {
    document.querySelector("#signGmass").style.display = "none";
  });

  document.querySelector(".modal-dialog").addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return modalContainer;
}
async function CheckSignedIn() {
  try {
    const sender = sessionStorage.getItem("sender");
    const response = await fetch(
      "https://acaderealty.com/isUserSigned?user=" + encodeURIComponent(sender),
      {
        method: "GET",
        headers: {
          "x-api-key": "priyam",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    const isSignedIn = data["isSignedIn"];

    if (!isSignedIn && sender.toLowerCase().includes("acadecraft")) {
      document.querySelector("#signGmass").style.display = "flex";
      console.log("Please sign-in with your authorized email.");
    } else if (!sender.toLowerCase().includes("acadecraft")) {
      console.log(
        "Your email is not authorized to use this feature. Please contact the administrator."
      );
    }
    return isSignedIn;
  } catch (error) {
    console.error("Error checking sign-in status:", error);
    return false;
  }
}

const sheetObserver = new MutationObserver(() => {
  const gmailSearch = document.querySelector("#aso_search_form_anchor");
  if (gmailSearch && !document.querySelector("#sheet-button")) {
    createSignUp();
    CheckSignedIn();
    createSheetList();

    const buttonContainer = document.createElement("div");
    const sheetButton = document.createElement("div");
    const report = document.createElement("a");
    report.href = `https://dashboard-9qu2jfsxr-priyam12111s-projects.vercel.app/:${sessionStorage.getItem(
      "sender"
    )}`;
    report.target = "_blank"; // Open link in a new tab
    report.id = "reportdata";

    sheetButton.id = "sheet-button";
    sheetButton.className = "sheet-button";
    sheetButton.title = "Connect to an email list in a Google Sheet.";

    buttonContainer.className = "button-container";
    gmailSearch.parentElement.style.display = "flex";
    gmailSearch.style.width = "100%";
    buttonContainer.appendChild(sheetButton);
    buttonContainer.appendChild(report);
    gmailSearch.parentElement.appendChild(buttonContainer);

    sheetButton.addEventListener("click", async () => {
      try {
        const isSignedIn = await CheckSignedIn();
        if (isSignedIn) {
          createMsgBox("Checking Permissions of Google Sheet...");
          await sheetListJs();
          document
            .querySelector(".sheet-list-container")
            .classList.toggle("hidden");
        } else {
          createMsgBox("Your email is not authorized to use this feature.");
        }
      } catch (error) {
        console.error("Error handling sheet button click:", error);
      }
    });

    sheetObserver.disconnect();
  }
});

sheetObserver.observe(document.body, { childList: true, subtree: true });
