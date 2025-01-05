console.log("Executing Sheet Script");
async function createSheetList() {
  const sheetListContainer = document.createElement("div");
  sheetListContainer.className = "sheet-list-container hidden";
  const sheetListHtmlUrl = chrome.runtime.getURL("assets/html/sheetList.html");

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
}
async function sheetListJs() {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/list-sheets?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender"))
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    const sheetList = document.querySelector("#dropdown-list");
    sheetList.innerHTML = "";

    data["result"].forEach((sheet) => {
      const sheetItem = document.createElement("li");
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
      sheetList.appendChild(sheetItem);
    });

    LoadsheetJS();
  } catch (error) {
    console.error("Error fetching sheet list:", error);
  }
}
function LoadsheetJS() {
  const dropdown = document.getElementById("dropdown");
  const placeholder = document.getElementById("dropdown-placeholder");
  const searchInput = document.getElementById("dropdown-search");
  const dropdownList = document.getElementById("dropdown-list");
  const SpreadsheetSave = document.getElementById("SpreadsheetSave");
  const sheetListContainer = document.querySelector(".sheet-list-container");
  const mainContainer = document.querySelector(".main");

  dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    placeholder.style.display = "none";
    searchInput.style.display = "flex";
    searchInput.focus();
    SpreadsheetSave.style.display = "none";
    dropdownList.classList.remove("hidden");
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

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
    }
  });

  dropdownList.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      placeholder.textContent = e.target.textContent;
      sessionStorage.setItem(
        "spreadsheetId",
        e.target.dataset.id.replace(/[()]/g, "")
      );
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
      dropdownList.classList.add("hidden");
    }
  });

  SpreadsheetSave.addEventListener("click", () => {
    console.log("Saving...");
    fetch(
      `http://127.0.0.1:5000/create-headers?sender=${sessionStorage.getItem(
        "sender"
      )}&spreadsheetId=${sessionStorage.getItem("spreadsheetId")}&newHeaders=${[
        "Opens",
        "Clicks",
      ]}`
    ).then((response) => {
      if (response.ok) {
        console.log("Headers created successfully.");
      } else {
        console.error("Failed to create headers:", response.statusText);
      }
    });

    sheetListContainer.classList.add("hidden");
  });

  sheetListContainer.addEventListener("click", () => {
    sheetListContainer.classList.toggle("hidden");
  });

  mainContainer.addEventListener("click", (event) => {
    event.stopPropagation();
    placeholder.style.display = "block";
    searchInput.style.display = "none";
    SpreadsheetSave.style.display = "block";
    dropdownList.classList.add("hidden");
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
    sheetListJs();
    setTimeout(() => {
      document.querySelector("#signGmass").style.display = "none";
    }, 2000);
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
      "http://127.0.0.1:5000/isUserSigned?user=" + sender
    );
    const data = await response.json();
    const isSignedIn = data["isSignedIn"];

    if (!isSignedIn && sender.toLowerCase().includes("acadecraft")) {
      document.querySelector("#signGmass").style.display = "flex";
    } else {
      console.log("Your email is not authorized to use this feature.");
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
    report.href = "http://localhost:5173/";
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
