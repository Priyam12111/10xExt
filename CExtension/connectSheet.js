console.log("Executing Sheet Script");
function createSheetList() {
  const sheetlist = document.createElement("div");
  sheetlist.className = "sheet-list-container hidden";
  const sheetListHtml = chrome.runtime.getURL("sheetList.html");
  fetch(sheetListHtml)
    .then((response) => response.text())
    .then((html) => {
      sheetlist.innerHTML = html;
      document.body.appendChild(sheetlist);
    })
    .then(() => sheetListJs());
}
function sheetListJs() {
  fetch(
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
    searchInput.style.display = "block";
    searchInput.focus();
    SpreadsheetSave.style.display = "none";
    dropdownList.classList.remove("hidden");
  });

  searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const listItems = dropdownList.querySelectorAll("li");
    listItems.forEach((item) => {
      if (item.textContent.toLowerCase().includes(searchValue)) {
        item.style.display = "block";
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
    sheet_list.classList.toggle("hidden");
  });

  sheet_list.addEventListener("click", () => {
    sheet_list.classList.toggle("hidden");
  });

  child_sheet_list.addEventListener("click", (event) => {
    event.stopPropagation();
    placeholder.style.display = "block";
    searchInput.style.display = "none";
    SpreadsheetSave.style.display = "flex";
    dropdownList.classList.add("hidden");
  });
}
const sheetObserver = new MutationObserver(() => {
  const gmailSearch = document.querySelector("#aso_search_form_anchor");

  if (gmailSearch && !document.querySelector("#sheet-button")) {
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

    sheetButton.addEventListener("click", () => {
      document
        .querySelector(".sheet-list-container")
        .classList.toggle("hidden");
    });

    sheetObserver.disconnect();
  }
});

sheetObserver.observe(document.body, { childList: true, subtree: true });
