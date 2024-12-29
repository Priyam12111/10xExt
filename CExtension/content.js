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
  button.id = id;
  button.innerHTML = `
      <button class="arrow-btn" id="rotateBtn">
        <svg class="arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>`;
  button.style.marginLeft = "0px";
  button.style.position = "relative";
  const dropupMenu = document.createElement("div");
  dropupMenu.style.position = "fixed";
  dropupMenu.style.display = "none";

  fetchAndInjectDropupMenu(dropupMenu);
  const gmailSubject = document.querySelector(".aO7");
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
  const trackingElement = document.querySelector("#iyEIROpenTracking");
  const followUpElement = document.querySelector("#followup");
  const inputDays = document.querySelector("#days");
  const schedule = document.querySelector("#EUYaSGMassDateDropdown");
  const scheduleinput = document.querySelector("#EUYaSGMassDateTime");
  const timeS1 = document.querySelector(".timeS1");
  const timeS2 = document.querySelector(".timeS2");
  const timeS3 = document.querySelector(".timeS3");
  const stage1 = document.querySelector("#stage1");
  const stage2 = document.querySelector("#stage2");
  const stage3 = document.querySelector("#stage3");
  const stagetextarea = document.querySelectorAll(".stagetextarea");
  if (schedule) {
    schedule.addEventListener("change", function (event) {
      const selectedValue = event.target.value;
      console.log("Selected value:", selectedValue);

      const now = new Date();
      console.log(now);
      let datetime;
      switch (selectedValue) {
        case "Now":
          datetime = now;
          scheduleinput.value = "Now";
          return;
        case "FiveMinutes":
          datetime = new Date(now.getTime() + 5 * 60 * 1000); // Add 5 minutes
          break;
        case "OneHour":
          datetime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
          break;
        case "ThreeHours":
          datetime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
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
          console.warn("Unexpected schedule value:", selectedValue);
          return;
      }

      const offsetInMilliseconds = 5.5 * 60 * 60 * 1000; // UTC+5:30
      const istDatetime = new Date(datetime.getTime() + offsetInMilliseconds);

      // Format IST datetime as "YYYY-MM-DDTHH:MM:SS" for datetime-local
      const formattedDatetime = istDatetime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      sessionStorage.setItem("schedule", datetime ? formattedDatetime : "");
      scheduleinput.value = formattedDatetime;
      scheduleinput.disabled = true;
    });
  }
  if (trackingElement) {
    trackingElement.addEventListener("change", () => {
      sessionStorage.setItem("tracking", trackingElement.checked);
    });
  }

  if (followUpElement && inputDays) {
    if (followUpElement.checked) {
      sessionStorage.setItem("followup", parseInt(inputDays.value) || 0);
    }

    followUpElement.addEventListener("click", () => {
      if (followUpElement.checked) {
        sessionStorage.setItem("followup", parseInt(inputDays.value) || 0);
      } else {
        sessionStorage.removeItem("followup");
      }
    });

    inputDays.addEventListener("change", () => {
      if (followUpElement.checked) {
        sessionStorage.setItem("followup", parseInt(inputDays.value) || 0);
      }
    });
  }

  if (stage1) {
    stage1.addEventListener("change", () => {
      timeS1.style.display = stage1.checked ? "block" : "none";
      document.querySelector(".S2").classList.toggle("hidden", !stage1.checked);
      sessionStorage.setItem("stage1", stage1.checked);
    });
  }
  if (stage2) {
    stage2.addEventListener("change", () => {
      timeS2.style.display = stage2.checked ? "block" : "none";
      document.querySelector(".S3").classList.toggle("hidden", !stage2.checked);

      sessionStorage.setItem("stage2", stage2.checked);
    });
  }
  if (stage3) {
    stage3.addEventListener("change", () => {
      timeS3.style.display = stage3.checked ? "block" : "none";
      sessionStorage.setItem("stage3", stage3.checked);
    });
  }
  if (stagetextarea) {
    const valuesArray = [];
    stagetextarea.forEach((textarea, index) => {
      textarea.addEventListener("change", function () {
        valuesArray[index] = textarea.value;
        sessionStorage.setItem(
          "stagetextarea-values",
          JSON.stringify(valuesArray)
        );
      });
    });
  }
}
sessionStorage.removeItem("tracking");
sessionStorage.removeItem("followup");
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
