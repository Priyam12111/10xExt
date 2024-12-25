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
      console.log("Sheet List Injected");
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
        sheetItem.textContent = sheetArray[0];
        sheetItem.setAttribute("data-id", sheetArray[sheetArray.length - 1]);
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

  dropdown.addEventListener("click", () => {
    placeholder.style.display = "none";
    searchInput.style.display = "block";
    searchInput.focus();
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
    console.log("Save button clicked!");
    sheet_list.classList.toggle("hidden");
  });
}
const sheetObserver = new MutationObserver(() => {
  const gmailSearch = document.querySelector("#aso_search_form_anchor");

  if (gmailSearch && !document.querySelector("#sheet-button")) {
    console.log("Gmail search found:", gmailSearch);
    createSheetList();
    const sheetButton = document.createElement("button");
    sheetButton.id = "sheet-button";
    sheetButton.className = "sheet-button";
    sheetButton.textContent = "Sheet";

    gmailSearch.parentElement.insertAdjacentElement("afterend", sheetButton);

    sheetButton.addEventListener("click", () => {
      console.log("Sheet button clicked!");
      document
        .querySelector(".sheet-list-container")
        .classList.toggle("hidden");
    });

    sheetObserver.disconnect();
  } else if (!gmailSearch) {
    console.log("Gmail search not found");
  }
});

sheetObserver.observe(document.body, { childList: true, subtree: true });
