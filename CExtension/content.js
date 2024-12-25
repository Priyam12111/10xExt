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
    .then((html) => {
      dropupMenu.innerHTML = html;
    })
    .then(() => dropupJs())
    .then(() => emailFunctionalities())
    .catch((err) => console.error("Error loading dropup menu HTML:", err));
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
function dropupJs() {
  const accordionTitles = document.querySelectorAll(".g_accordian_title");
  accordionTitles.forEach((title) => {
    title.addEventListener("click", () => {
      const content = title.nextElementSibling;
      content.classList.toggle("active");
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

function emailFunctionalities() {
  const trackingElement = document.querySelector("#iyEIROpenTracking");
  const followUpElement = document.querySelector("#followup");
  const inputDays = document.querySelector("#days");

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
}
sessionStorage.removeItem("tracking");
sessionStorage.removeItem("followup");

const observer = new MutationObserver(() => {
  const composeToolbar = document.querySelector(".gU.Up");
  const sender = document.title.split(" ")[3];
  if (sender && !sessionStorage.getItem("sender")) {
    sessionStorage.setItem("sender", document.title.split(" ")[3]);
  }
  if (composeToolbar && !document.getElementById("cmail-button")) {
    const { button, dropupMenu } = createButton("cmail-button");

    const sendButton = createSendButton();
    composeToolbar.appendChild(sendButton);
    composeToolbar.appendChild(button);
    composeToolbar.appendChild(dropupMenu);
    appendConnectButton();
    emailFunctionalities();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
