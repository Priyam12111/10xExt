console.log("Executing Content Script");

const observer = new MutationObserver(() => {
  const composeToolbar = document.querySelector(".gU.Up");

  if (composeToolbar && !document.getElementById("cmail-button")) {
    let newElement = document.createElement("div");
    newElement.setAttribute("role", "button");
    newElement.textContent = "Send";
    newElement.id = "send-button";
    let oldElement = document.querySelector(".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3");
    oldElement.parentNode.replaceChild(newElement, oldElement);

    newElement.addEventListener("click", function (event) {
      event.preventDefault();
      sendMails();
    });

    const button = document.createElement("button");
    button.id = "cmail-button";
    button.textContent = "Cmail";
    button.style.marginLeft = "10px";
    button.style.position = "relative";
    // =================================================================================================
    const dropupMenu = document.createElement("div");
    dropupMenu.style.display = "none";
    const htmlUrl = chrome.runtime.getURL("dropupMenu.html");
    fetch(htmlUrl)
      .then((response) => response.text())
      .then((html) => {
        dropupMenu.innerHTML = html;
        document.body.appendChild(dropupMenu);
      })
      .catch((err) => console.error("Error loading dropup menu HTML:", err));
    // =================================================================================================

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

    document.body.appendChild(containerContent);
    dropupMenu.appendChild(container);

    composeToolbar.appendChild(button);
    composeToolbar.appendChild(dropupMenu);
    const emailSubjectInput = document.getElementById("email-subject");
    const emailBodyInput = document.getElementById("email-body");
    const saveButton = document.getElementById("save-button");
    saveButton.addEventListener("click", function () {
      console.log("Save Button Clicked");
      localStorage.setItem("Subject", emailSubjectInput.value);
      localStorage.setItem("EmailBody", emailBodyInput.value);
      dropupMenu.style.display = "none";
      container.style.display = "none";
      containerContent.style.display = "none";
    });

    button.addEventListener("click", function () {
      if (dropupMenu.style.display === "none") {
        dropupMenu.style.display = "block";
        test_input = document.querySelector("#test-input");
        test_email_send = document.querySelector("#test-send");
        test_email_send.addEventListener("click", function () {
          sessionStorage.setItem("test_email", test_input.value);
          sendTestMail();
        });
        const ConfigureButton = document.querySelector("#configure-button");
        const tracking = document.querySelector("#iyEIROpenTracking");
        tracking.addEventListener("click", function () {
          sessionStorage.setItem("tracking", tracking.checked);
        });
        ConfigureButton.addEventListener("click", function () {
          const dropdown =
            container.style.display === "block" ? "none" : "block";
          containerContent.style.display = dropdown;
          container.style.display = dropdown;
          const closebutton = document.querySelector("#close-button");
          closebutton.addEventListener("click", function () {
            console.log("Close Button Clicked");
            container.style.display = "none";
            containerContent.style.display = "none";
          });
        });
      } else {
        dropupMenu.style.display = "none";
      }
    });

    document.addEventListener("click", function (event) {
      if (
        !button.contains(event.target) &&
        !dropupMenu.contains(event.target)
      ) {
        dropupMenu.style.display = "none";
      }
    });
    const connect = document.createElement("span");
    connect.id = ":iv";
    connect.className = "aB gQ pE";
    connect.textContent = "Connect";
    connect.onclick = fetchEmailColumnFromSheet;

    const targetElement = document.querySelector(".baT");

    if (targetElement) {
      targetElement.appendChild(connect);
    } else {
      console.error("Element with class '.baT' not found");
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

function fetchEmailColumnFromSheet() {
  const spreadsheetId = "1ew1XtbawQhX_3fH9DrZoP4avxGBnRrpw3y8TZKutdDc";
  const range = "Sheet1!K:L";

  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const apiKey = "AIzaSyC7Ubf5000J30CudwmIaxIgSz-vhJhe3-A";

  fetch(`${endpoint}?key=${apiKey}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.values && data.values.length > 0) {
        let emails = [];
        let names = [];
        data.values.forEach((row) => {
          if (row[0]) {
            emails.push(row[0]);
            names.push(row[1]);
          }
        });
        console.log(names);
        console.log(emails);
        sessionStorage.setItem("names", JSON.stringify(names));
        sessionStorage.setItem("emails", JSON.stringify(emails));
        console.log("LocalStorage", localStorage);
        const Subject = localStorage.getItem("Subject") || "Test Email";
        const emailBody =
          localStorage.getItem("EmailBody") || "Hello, this is a test email.";

        if (emails.length > 0) {
          setEmailDetails(emails.slice(1), Subject, emailBody);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      document.getElementById("data").textContent =
        "Failed to fetch data. Please check the console for errors.";
    });
}

function setEmailDetails(emails, subject, body) {
  const emailField = document.querySelector(".agP.aFw");
  if (emailField.getAttribute("aria-label") === "To recipients") {
    emailField.value = emails.join(", ");
    const subjectField = document.querySelector(".aoT");
    if (subjectField.getAttribute("aria-label") === "To recipients") {
      subjectField.value = emails.join(", ");
    } else {
      subjectField.value = subject;
    }
  } else {
    emailField.value = subject;
  }

  const bodyField = document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW");
  if (bodyField) {
    bodyField.innerHTML = body;
  }
}

function sendMails() {
  const track = JSON.parse(sessionStorage.getItem("tracking") || "false");

  fetch("http://127.0.0.1:5000/send-mails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: document.querySelector(".aoT").value,
      body: document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW")
        .textContent,
      emails: (() => {
        const emails = JSON.parse(sessionStorage.getItem("emails") || "[]");
        const names = JSON.parse(sessionStorage.getItem("names") || "[]");

        return emails.map((email, index) => ({
          email: email,
          variables: { name: names[index] || "Recipient" },
        }));
      })(),
      tracking: track,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      alert("Mail Sent!");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Mail Not Sent!");
    });
}

function sendTestMail() {
  console.log("Sending Test Email");
  try {
    fetch("http://127.0.0.1:5000/send-mails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: document.querySelector(".aoT").value,
        body: "This is a test email.",
        emails: (() => {
          const emails = [sessionStorage.getItem("test_email")];
          const names = ["Test User"];
          console.log(emails, names);
          return emails.map((email, index) => ({
            email: email,
            variables: { name: names[index] || "Recipient" },
          }));
        })(),
        tracking: false,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        alert("Test Mail Sent!");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Test Mail Not Sent!");
      });
  } catch (e) {
    console.log(e);
  }
}
