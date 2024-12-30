console.log("Executing Content Script");

function createSendButton() {
  const sendButton = document.createElement("div");
  sendButton.setAttribute("role", "button");
  sendButton.textContent = "Cmail";
  sendButton.id = "send-button";

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    sendMails();
  });

  return sendButton;
}

function createButton(id) {
  const button = document.createElement("button");
  const dropupMenu = document.createElement("div");
  const gmailSubject = document.querySelector(".aO7");

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
  gmailSubject.onclick = () => (dropupMenu.style.display = "none");
  button.addEventListener("click", () => toggleDropupMenu(dropupMenu));
  return { button, dropupMenu };
}

function fetchAndInjectDropupMenu(dropupMenu) {
  const htmlUrl = chrome.runtime.getURL("dropupMenu.html");
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

      return iframe; // Return iframe to be used later
    })
    .then((iframe) => {
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
  document.querySelector(".arrow").classList.toggle("rotate");
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

  const sendButton = document.getElementById("test-send");
  const testInput = document.getElementById("test-input");
  if (sendButton && testInput) {
    sendButton.addEventListener("click", () => {
      const email = testInput.value;
      alert(`Test email sent to ${email}`);
    });
  }

  const { containerbox, containerContentbox } = createEmailForm();

  const configureButton = document.getElementById("configure-button");
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
  const stages = ["stage1", "stage2", "stage3"];
  const times = [".timeS1", ".timeS2", ".timeS3"];
  const stageInputs = [
    ".stageNumberinputS1",
    ".stageNumberinputS2",
    ".stageNumberinputS3",
  ];
  const stageContainers = [".S1", ".S2", ".S3"];
  const stagetextarea = document.querySelectorAll(".stagetextarea");

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

sessionStorage.removeItem("tracking");
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
