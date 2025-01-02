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
  const htmlUrl = chrome.runtime.getURL("dropupMenu.html");
  const cssUrl = chrome.runtime.getURL("styledrop.css");

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

      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = cssUrl;
      doc.head.appendChild(link);

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
  connect.onclick = fetchDataFromSheet;

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
  const SendDaysOn = document.querySelector("#EUYaSSendDaysOn");
  const dropdowndays = document.getElementById("listsecOpenDays");
  const triggerdays = document.querySelector(".senddays");
  const itemsdays = document.querySelectorAll("label.form-check-label");
  const checkboxes = document.querySelectorAll(".form-check-input");
  const sendButton = document.getElementById("test-send");
  const testInput = document.getElementById("test-input");
  const { containerbox, containerContentbox } = createEmailForm();
  const configureButton = document.getElementById("configure-button");

  SendDaysOn.addEventListener("change", () => {
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

function emailFunctionalities(document) {
  const schedule = document.querySelector("#EUYaSGMassDateDropdown");
  const scheduleinput = document.querySelector("#EUYaSGMassDateTime");
  const followUpElement = document.querySelector("#followup");
  const inputDays = document.querySelector("#days");
  const trackingElement = document.querySelector("#iyEIROpenTracking");
  const stagetextarea = document.querySelectorAll(".stagetextarea");
  const unsubLink = document.querySelector("#unsubLink");
  const MaxEmails = document.querySelector("#bqpifMaxEmails");
  const DelayCheckbox = document.querySelector("#bqpifDelayCheckbox");
  const PauseSeconds = document.querySelector("#bqpifPauseSeconds");
  const stages = ["stage1", "stage2", "stage3"];
  const times = [".timeS1", ".timeS2", ".timeS3"];
  const stageContainers = [".S1", ".S2", ".S3"];
  const stageInputs = [
    ".stageNumberinputS1",
    ".stageNumberinputS2",
    ".stageNumberinputS3",
  ];
  MaxEmails.addEventListener("change", () => {
    sessionStorage.setItem("MaxEmails", MaxEmails.value);
  });

  const updateDelaySetting = () =>
    sessionStorage.setItem(
      "DelayCheckbox",
      DelayCheckbox.checked ? PauseSeconds.value : "0"
    );

  DelayCheckbox.addEventListener("change", updateDelaySetting);
  PauseSeconds.addEventListener("change", updateDelaySetting);

  unsubLink.addEventListener("click", () => {
    createMsgBox("Unsubscribe link added");
    console.log("Adding unsubscribe link");
    const emailBody = window.document.querySelector(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    );
    if (emailBody) {
      emailBody.innerHTML += `\n\n<a href="http://127.0.0.1:5000/unsubscribe?Email=#&userID=#">Unsubscribe</a>`;
      sessionStorage.setItem("unsubscribed", true);
    } else {
      console.error("Email body element not found.");
    }
  });
  const updateSchedule = (value) => {
    const now = new Date();
    let datetime;

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
        scheduleinput.value = "";
        scheduleinput.disabled = false;
        scheduleinput.addEventListener("change", () => {
          sessionStorage.setItem("schedule", scheduleinput.value);
        });
        return;
      default:
        console.warn("Unexpected schedule value:", value);
        return;
    }

    const offset = 5.5 * 60 * 60 * 1000; // UTC+5:30
    const istDatetime = new Date(datetime.getTime() + offset);
    const formattedDatetime = istDatetime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    sessionStorage.setItem("schedule", formattedDatetime);
    scheduleinput.value = formattedDatetime;
    scheduleinput.disabled = true;
  };

  if (schedule) {
    schedule.addEventListener("change", (e) => updateSchedule(e.target.value));
  }

  if (trackingElement) {
    trackingElement.addEventListener("change", () => {
      sessionStorage.setItem("tracking", trackingElement.checked);
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
        if (nextStageContainer) {
          nextStageContainer.classList.toggle("hidden", !stage.checked);
        }
        sessionStorage.setItem(stageId, stage.checked ? stageInput.value : "");
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
sessionStorage.setItem("DelayCheckbox", "1");

const observer = new MutationObserver(() => {
  const composeToolbars = document.querySelectorAll(".gU.Up");
  const sender = document.title.split(" ")[3];

  if (sender && !sessionStorage.getItem("sender")) {
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
