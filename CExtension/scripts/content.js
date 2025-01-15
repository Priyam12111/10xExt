console.log("Executing Content Script");
function createSendButton() {
  const sendButton = document.createElement("div");
  sendButton.setAttribute("role", "button");
  sendButton.textContent = "Cmail";
  sendButton.id = "send-button";

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    sendMails();
  });

  return sendButton;
}

function createButton(id) {
  const button = document.createElement("button");
  const dropupMenu = document.createElement("div");

  button.id = id;
  button.innerHTML = `
      <button class="arrow-btn" id="rotateBtn">
        <svg class="arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>`;
  button.style.marginLeft = "0px";
  button.style.position = "relative";
  dropupMenu.style.position = "fixed";
  dropupMenu.style.display = "none";

  fetchAndInjectDropupMenu(dropupMenu);

  document.addEventListener("click", () => {
    if (dropupMenu.style.display === "block") {
      toggleDropupMenu(dropupMenu);
    }
  });

  dropupMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropupMenu(dropupMenu);
  });
  return { button, dropupMenu };
}
function fetchAndInjectDropupMenu(dropupMenu) {
  const htmlUrl = chrome.runtime.getURL("assets/html/dropupMenu.html");
  fetch(htmlUrl)
    .then((response) => response.text())
    .then((htmlContent) => {
      const iframe = document.createElement("iframe");
      iframe.style.border = "none";
      dropupMenu.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      iframe.onload = () => {
        const doc = iframe.contentWindow.document;
        dropupJs(doc);
        emailFunctionalities(doc);
      };
    })
    .catch((error) => {
      console.error("Error loading the HTML:", error);
    });
}

function toggleDropupMenu(dropupMenu) {
  const arrow = document.querySelector(".arrow");
  if (arrow) {
    arrow.classList.toggle("rotate");
  }
  dropupMenu.style.display =
    dropupMenu.style.display === "none" ? "block" : "none";
}

function createEmailForm() {
  const container = document.createElement("div");
  container.style.display = "none";

  const containerContent = document.createElement("div");
  containerContent.style.display = "none";
  containerContent.innerHTML = `
    <div class="form-container containerContent">
      <div class="template">
        <button id="close-button" aria-label="Close">×</button>
        <div class="form-content">
          <input
            type="text"
            id="email-subject"
            placeholder="Subject"
            aria-label="Email Subject"
          />
          <textarea
            id="email-body"
            placeholder="Email Body"
            aria-label="Email Body"
          ></textarea>
          <button id="save-button">Save</button>
        </div>
      </div>
    </div>
  `;

  container.appendChild(containerContent);
  document.body.appendChild(container);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      console.log("ESC Key Pressed");
      const trackingElement = document.querySelector("#iyEIROpenTracking");
      const followUpElement = document.querySelector("#followup");

      console.log(!trackingElement);
      if (!trackingElement) {
        sessionStorage.setItem("tracking", false);
      }
      if (!followUpElement) {
        sessionStorage.setItem("followup", 0);
      }
      try {
        container.style.display = "none";
        containerContent.style.display = "none";
      } catch (e) {
        console.error("Error handling Escape key:", e);
      }
    }
  });

  const saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", () => saveEmailForm(containerContent));

  return { containerbox: container, containerContentbox: containerContent };
}

function saveEmailForm(containerContent) {
  const emailSubjectInput = document.getElementById("email-subject");
  const emailBodyInput = document.getElementById("email-body");

  localStorage.setItem("Subject", emailSubjectInput.value);
  localStorage.setItem("EmailBody", emailBodyInput.value);

  containerContent.style.display = "none";
}

function appendConnectButton() {
  const connect = document.createElement("span");
  connect.id = "connect-button";
  connect.className = "aB gQ pE";
  connect.textContent = "Connect";
  connect.addEventListener("click", () => {
    createMsgBox("Fetching data from Google Sheet...");
    fetchDataFromSheet();
  });

  const targetElement = document.querySelector(".baT");
  if (targetElement) {
    targetElement.appendChild(connect);
  } else {
    console.error("Element with class '.baT' not found");
  }
}

function toggleContainerDisplay(container, containerContent) {
  const dropdown = container.style.display === "block" ? "none" : "block";
  containerContent.style.display = dropdown;
  container.style.display = dropdown;
  const closeButton = document.querySelector("#close-button");
  if (!closeButton.hasAttribute("data-event-attached")) {
    closeButton.setAttribute("data-event-attached", "true");
    closeButton.addEventListener("click", () => {
      console.log("Close Button Clicked");
      container.style.display = "none";
      containerContent.style.display = "none";
    });
  }
}
function dropupJs(document) {
  const accordionTitles = document.querySelectorAll(".g_accordian_title");
  const { containerbox, containerContentbox } = createEmailForm();
  const SendDaysOn = document.querySelector("#EUYaSSendDaysOn");
  const dropdowndays = document.getElementById("listsecOpenDays");
  const triggerdays = document.querySelector(".senddays");
  const itemsdays = document.querySelectorAll("label.form-check-label");
  const checkboxes = document.querySelectorAll(".form-check-input");
  const sendButton = document.getElementById("test-send");
  const testInput = document.getElementById("test-input");
  const configureButton = document.getElementById("configure-button");
  const dropdownHeader = document.querySelector(".dropdown-header");
  const dropdownContent = document.querySelector(".dropdown-content");
  const searchInput = dropdownContent.querySelector("input");
  const Fields = dropdownContent.querySelector(".personalize-list");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const lists = document.createElement("li");

  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${key}</span>`;
      Fields.appendChild(listItem);
    });
  } else {
    lists.innerHTML = `
    <li><span>No variables found</span></li>
  `;
  }

  Fields.appendChild(lists);

  const listItems = Array.from(
    dropdownContent.querySelectorAll(".dropdown-list li")
  );

  dropdownHeader.addEventListener("click", () => {
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  });
  searchInput.addEventListener("input", (event) => {
    const filter = event.target.value.toLowerCase();
    listItems.forEach((item) => {
      if (item.textContent.toLowerCase().includes(filter)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (
      !dropdownHeader.contains(event.target) &&
      !dropdownContent.contains(event.target)
    ) {
      dropdownContent.style.display = "none";
    }
  });
  SendDaysOn.addEventListener("change", () => {
    triggerdays.classList.toggle("hidden");
    sessionStorage.setItem("SendDaysOn", SendDaysOn.checked);
  });

  triggerdays.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdowndays.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!dropdowndays.contains(e.target) && !triggerdays.contains(e.target)) {
      dropdowndays.classList.add("hidden");
    }
  });

  itemsdays.forEach((item) => {
    item.addEventListener("click", () => {
      console.log("item clicked");
      triggerdays.querySelector("span").textContent = item.textContent;
      dropdowndays.classList.add("hidden");
    });
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const updatedCheckedDays = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      sessionStorage.setItem("checkedDays", JSON.stringify(updatedCheckedDays));
    });
  });

  accordionTitles.forEach((title) => {
    title.addEventListener("click", () => {
      const content = title.nextElementSibling;
      if (content.classList.contains("buttonshowpice")) {
        content.classList.toggle("hidden");
        content.nextElementSibling.classList.toggle("active");
      } else {
        content.classList.toggle("active");
      }
    });
  });

  if (sendButton && testInput) {
    sendButton.addEventListener("click", () => {
      const email = testInput.value;
      sendTestMail();
      alert(`Test email sent to ${email}`);
    });
  }

  if (configureButton) {
    const newConfigureButton = configureButton.cloneNode(true);
    configureButton.parentNode.replaceChild(
      newConfigureButton,
      configureButton
    );
    newConfigureButton.addEventListener("click", () =>
      toggleContainerDisplay(containerbox, containerContentbox)
    );
  }
}
function updateSchedule(value, scheduleinput) {
  const now = new Date();
  let datetime;

  const formatIST = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  switch (value) {
    case "Now":
      datetime = now;
      break;
    case "FiveMinutes":
      datetime = new Date(now.getTime() + 5 * 60 * 1000);
      break;
    case "OneHour":
      datetime = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case "ThreeHours":
      datetime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      break;
    case "TomorrowMor":
      datetime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        8,
        0,
        0
      );
      break;
    case "TomorrowAft":
      datetime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        13,
        0,
        0
      );
      break;
    case "TomorrowEve":
      datetime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        19,
        0,
        0
      );
      break;
    case "Custom":
      scheduleinput.disabled = false;
      scheduleinput.value = formatIST(datetime);
      scheduleinput.addEventListener("change", () => {
        sessionStorage.setItem("schedule", scheduleinput.value);
      });
      return;
    default:
      console.warn("Unexpected schedule value:", value);
      return;
  }

  const formattedDatetime = formatIST(datetime);
  sessionStorage.setItem("schedule", formattedDatetime);
  scheduleinput.value = formattedDatetime;
  scheduleinput.disabled = true;
}
function messageFunctionality(document) {
  const dropdownmessages = [
    "listsecOpenMessageS1",
    "listsecOpenMessageS2",
    "listsecOpenMessageS3",
  ];

  const messages = document.querySelectorAll(".mesagePosi");
  messages.forEach((message, index) => {
    message.addEventListener("click", (event) => {
      event.stopPropagation();
      const msgdropdown = document.querySelector(`#${dropdownmessages[index]}`);
      msgdropdown.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      msgdropdown.classList.toggle("hidden");
    });
  });
}

function emailFunctionalities(document) {
  const schedule = document.querySelector("#EUYaSGMassDateDropdown");
  const followUpElement = document.querySelector("#followup");
  const inputDays = document.querySelector("#days");
  const trackingElement = document.querySelector("#iyEIROpenTracking");
  const UrlTrack = document.querySelector("#iyEIROpenClick");
  const unsubLink = document.querySelector("#unsubLink");
  const MaxEmails = document.querySelector("#bqpifMaxEmails");
  const DelayCheckbox = document.querySelector("#bqpifDelayCheckbox");
  const PauseSeconds = document.querySelector("#bqpifPauseSeconds");

  const scheduleinput = document.querySelector("#EUYaSGMassDateTime");
  const followuptime = document.querySelector("#daysS1");

  const showButtons = document.querySelectorAll(".showP");
  const ClickShowPiece = document.querySelector(".ClickShowPiece");
  const OpenShowPiece = document.querySelector(".OpenShowPiece");
  const pauseShowPice = document.querySelector(".pauseShowPice");

  const stages = ["stage1", "stage2", "stage3"];
  const times = [".timeS1", ".timeS2", ".timeS3"];
  const stageContainers = [".S1", ".S2", ".S3"];
  const stagetextarea = document.querySelectorAll(".stagetextarea");
  try {
    messageFunctionality(document);
  } catch (error) {
    console.error("Error in messageFunctionality:", error);
  }

  followuptime.addEventListener("change", () => {
    sessionStorage.setItem("followuptime", followuptime.value);
  });

  const stageInputs = [
    ".stageNumberinputS1",
    ".stageNumberinputS2",
    ".stageNumberinputS3",
  ];

  const setTime = document.querySelectorAll(".settime");
  setTime.forEach((time, index) => {
    time.addEventListener("click", () => {
      const formCheck = document.querySelector(`${times[index]} .form-check`);
      if (formCheck) {
        formCheck.classList.toggle("hidden");
      } else {
        console.error(
          `Element not found for selector: ${times[index]} .form-check`
        );
      }
    });
  });
  MaxEmails.addEventListener("change", () => {
    sessionStorage.setItem("MaxEmails", MaxEmails.value);
  });

  const updateDelaySetting = () => {
    pauseShowPice.classList.toggle("hidden", !DelayCheckbox.checked);
    sessionStorage.setItem(
      "DelayCheckbox",
      DelayCheckbox.checked ? PauseSeconds.value : "0"
    );
  };
  DelayCheckbox.addEventListener("change", updateDelaySetting);
  PauseSeconds.addEventListener("change", updateDelaySetting);

  unsubLink.addEventListener("click", () => {
    createMsgBox("Unsubscribe link added");
    console.log("Adding unsubscribe link");
    const emailBody = window.document.querySelector(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    );
    if (emailBody) {
      emailBody.innerHTML += `\n\n<a href="https://acaderealty.com/unsubscribe?Email=#&userID=#">Unsubscribe</a>`;
      sessionStorage.setItem("unsubscribed", true);
    } else {
      console.error("Email body element not found.");
    }
  });

  if (schedule) {
    schedule.addEventListener("change", (e) => {
      if (e.target.value !== "Now") {
        document
          .querySelector(".gmass-expand-field")
          .classList.remove("hidden");
      } else {
        document.querySelector(".gmass-expand-field").classList.add("hidden");
      }
      updateSchedule(e.target.value, scheduleinput);
    });
  }

  if (trackingElement) {
    trackingElement.addEventListener("change", () => {
      OpenShowPiece.classList.toggle("hidden", !trackingElement.checked);
      sessionStorage.setItem("tracking", trackingElement.checked);
    });
  }
  if (UrlTrack) {
    UrlTrack.addEventListener("change", () => {
      ClickShowPiece.classList.toggle("hidden", !UrlTrack.checked);
    });
  }

  if (followUpElement && inputDays) {
    const updateFollowUp = () => {
      sessionStorage.setItem(
        "followup",
        followUpElement.checked ? parseInt(inputDays.value) || 0 : ""
      );
    };
    followUpElement.addEventListener("click", updateFollowUp);
    inputDays.addEventListener("change", updateFollowUp);
  }

  stages.forEach((stageId, index) => {
    const stage = document.querySelector(`#${stageId}`);
    const timeSelector = document.querySelector(times[index]);
    const stageInput = document.querySelector(stageInputs[index]);
    if (index < 2) {
      var nextStageContainer = document.querySelector(
        stageContainers[index + 1]
      );
    }

    if (stage) {
      stage.addEventListener("change", () => {
        timeSelector.style.display = stage.checked ? "block" : "none";
        showButtons[index].classList.toggle("hidden", !stage.checked);

        if (nextStageContainer) {
          nextStageContainer.classList.toggle("hidden", !stage.checked);
        }
        sessionStorage.setItem(
          stageId,
          stage.checked
            ? stageInput.value === ""
              ? "0"
              : stageInput.value
            : ""
        );
      });
      stageInput.addEventListener("change", () => {
        sessionStorage.setItem(stageId, stage.checked ? stageInput.value : "0");
      });
    }
  });
  const sendTextConfirm = document.querySelectorAll(".sendoriginal");
  sendTextConfirm.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      sessionStorage.setItem(
        "stagetextarea-values",
        stagetextarea[index].value
      );
    });
  });

  if (stagetextarea) {
    const valuesArray = new Array(stagetextarea.length).fill("");
    stagetextarea.forEach((textarea, index) => {
      textarea.addEventListener("change", () => {
        if (sendTextConfirm[index].checked === true) {
          valuesArray[index] = textarea.value;
          sessionStorage.setItem(
            "stagetextarea-values",
            JSON.stringify(valuesArray)
          );
        }
      });
    });
  }
}
sessionStorage.setItem("tracking", true);
sessionStorage.removeItem("schedule");
sessionStorage.removeItem("stage1");
sessionStorage.removeItem("stage2");
sessionStorage.removeItem("stage3");

const observer = new MutationObserver(() => {
  const composeToolbars = document.querySelectorAll(".gU.Up");
  let sender = document.querySelector(".gb_A.gb_Xa.gb_Z");

  if (sender && !sessionStorage.getItem("sender")) {
    sender = sender.getAttribute("aria-label").split("\n");
    sender = sender[sender.length - 1].replace("(", "").replace(")", "");
    sessionStorage.setItem("sender", sender);
  }

  composeToolbars.forEach((composeToolbar) => {
    if (!composeToolbar.querySelector("#cmail-button")) {
      const { button, dropupMenu } = createButton("cmail-button");
      const sendButton = createSendButton();

      composeToolbar.appendChild(sendButton);
      composeToolbar.appendChild(button);
      composeToolbar.appendChild(dropupMenu);

      appendConnectButton();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
