console.log("Executing Sheet Script");
async function createSheetList() {
  const sheetlist = document.createElement("div");
  sheetlist.className = "sheet-list-container hidden";
  const sheetListHtml = chrome.runtime.getURL("sheetList.html");

  try {
    const response = await fetch(sheetListHtml);
    const html = await response.text();
    sheetlist.innerHTML = html;
    document.body.appendChild(sheetlist);
  } catch (error) {
    console.error("Error creating sheet list:", error);
  }
}
async function sheetListJs() {
  await fetch(
    "http://127.0.0.1:5000/list-sheets?sender=" +
      encodeURIComponent(sessionStorage.getItem("sender"))
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const sheetList = document.querySelector("#dropdown-list");

      sheetList.innerHTML = "";

      data["result"].forEach((sheet) => {
        const sheetItem = document.createElement("li");
        const sheetArray = sheet.split(" ");
        sheetItem.innerHTML = `
<li data-id="${
          sheetArray[sheetArray.length - 1]
        }" style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #ddd;">
  <img 
    src="https://cdn.gmass.us/img2017/google-sheets.png" 
    alt="Google Sheets Icon" 
    width="50" 
    height="50"
    style="border-radius: 4px;"
  >
  <span style="font-size: 16px; font-weight: 500; color: #333;">
    ${sheetArray.slice(0, -1).join(" ")}
  </span>
</li>
        `;
        sheetList.appendChild(sheetItem);
      });
    })
    .then(() => LoadsheetJS());
}
function LoadsheetJS() {
  const dropdown = document.getElementById("dropdown");
  const placeholder = document.getElementById("dropdown-placeholder");
  const searchInput = document.getElementById("dropdown-search");
  const dropdownList = document.getElementById("dropdown-list");
  const SpreadsheetSave = document.getElementById("SpreadsheetSave");
  const sheet_list = document.querySelector(".sheet-list-container");
  const child_sheet_list = document.querySelector(".main");

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
      if (item.textContent.toLowerCase().includes(searchValue)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
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
        e.target.getAttribute("data-id").replace("(", "").replace(")", "")
      );
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
      dropdownList.classList.add("hidden");
    }
  });

  SpreadsheetSave.addEventListener("click", () => {
    console.log("Saving...");
    sheet_list.classList.add("hidden");
    console.log(sheet_list);
  });

  sheet_list.addEventListener("click", () => {
    sheet_list.classList.toggle("hidden");
  });

  child_sheet_list.addEventListener("click", (event) => {
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

  // Add the modal content dynamically
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
  const response = await fetch(
    "http://127.0.0.1:5000/isUserSigned?user=" +
      sessionStorage.getItem("sender")
  );
  const data = await response.json();
  const isSignedIn = data["isSignedIn"];

  if (!isSignedIn) {
    document.querySelector("#signGmass").style.display = "flex";
  }
  return isSignedIn;
}
const sheetObserver = new MutationObserver(() => {
  const gmailSearch = document.querySelector("#aso_search_form_anchor");

  if (gmailSearch && !document.querySelector("#sheet-button")) {
    createSignUp();
    CheckSignedIn();
    createSheetList();
    const sheetButton = document.createElement("div");
    sheetButton.textContent = "Sheet";
    sheetButton.innerHTML = `
<div 
  id="sheet-button" 
  class="sheet-button" 
  title="Connect to an email list in a Google Sheet." 
</div>

    `;
    gmailSearch.parentElement.style.display = "flex";
    gmailSearch.style.width = "100%";
    gmailSearch.parentElement.appendChild(sheetButton);
    sheetButton.addEventListener("click", async () => {
      try {
        const isSignedIn = await CheckSignedIn();
        if (isSignedIn) {
          await sheetListJs();
          await createMsgBox("Checking Permissions of Google Sheet...");
          document
            .querySelector(".sheet-list-container")
            .classList.toggle("hidden");
        } else {
          document.querySelector("#signGmass").style.display = "flex";
        }
      } catch (error) {
        console.error(error);
      }
    });

    sheetObserver.disconnect();
  }
});

sheetObserver.observe(document.body, { childList: true, subtree: true });
