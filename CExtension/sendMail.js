function fetchDataFromSheet() {
  createMsgBox("Fetching data from Google Sheet...");
  const sheetList = document.querySelector(".sheet-list-container");
  const spreadsheetId = sessionStorage.getItem("spreadsheetId");

  if (!spreadsheetId) {
    sheetList.classList.remove("hidden");
    return;
  }
  const sender = document.title.split(" ")[3];
  const range = "Sheet1!A:Z";
  const endpoint = `http://localhost:5000/sheet-data?sender=${sender}&spreadsheetId=${spreadsheetId}&range=${range}`;

  fetch(`${endpoint}`)
    .then((response) =>
      response.ok
        ? response.json()
        : Promise.reject(`HTTP error! status: ${response.status}`)
    )
    .then((data) => {
      if (data.values && data.values.length > 0) {
        const [headers, ...allData] = data.values;
        const { storedData, variables } = processData(headers, allData);

        sessionStorage.setItem("variables", JSON.stringify(variables));
        sessionStorage.setItem(
          "emails",
          JSON.stringify(storedData["Email"] || [])
        );

        const Subject = localStorage.getItem("Subject") || "Test Email";
        const emailBody =
          localStorage.getItem("EmailBody") || "Hello, this is a test email.";

        if (storedData["Email"] && storedData["Email"].length > 0) {
          setEmailDetails(storedData["Email"], Subject, emailBody);
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // alert("Failed to fetch data. Please check the console for errors.");
      createMsgBox(
        "Failed to fetch data. Please check the console for errors."
      );
      document.getElementById("data").textContent =
        "Failed to fetch data. Please check the console for errors.";
    });
}
function processData(headers, allData) {
  let storedData = { Email: [] };
  let variables = {};

  allData.forEach((row) => {
    headers.forEach((header, index) => {
      if (row[index]) {
        if (header !== "Email" && !header.includes("Email")) {
          variables[header] = variables[header] || [];
          variables[header].push(row[index]);
        } else {
          storedData["Email"] = storedData["Email"] || [];
          storedData["Email"].push(row[index]);
        }
      }
    });
  });

  return { storedData, variables };
}

function setEmailDetails(emails, subject, body) {
  const emailField = document.querySelector(".agP.aFw");
  if (emailField.getAttribute("aria-label") === "To recipients") {
    emailField.value = emails.join(", ");
    const subjectField = document.querySelector(".aoT");
    subjectField.value =
      subjectField.getAttribute("aria-label") === "To recipients"
        ? emails.join(", ")
        : subject;
  } else {
    emailField.value = subject;
  }

  const bodyField = document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW");
  if (bodyField) {
    bodyField.innerHTML = body;
  }
}

async function sendMails() {
  const track = JSON.parse(sessionStorage.getItem("tracking") || "false");
  const sendingAnimation = createSendingAnimation("Processing...");
  document.body.appendChild(sendingAnimation);

  try {
    const uploadId = await fetch("http://127.0.0.1:5000/latest_id")
      .then((res) => res.text())
      .then((id) => JSON.parse(id).Latest_id + 1);
    const sender = document.title.split(" ")[3];
    const subject = document.querySelector(".aoT").value;
    const body = document.querySelector(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    ).textContent;
    const schedule = sessionStorage.getItem("schedule") || "";

    if (schedule === "" || schedule === "Now") {
      const sendMailResponse = await sendEmailRequest(
        sender,
        uploadId,
        subject,
        body,
        track
      );
      console.log(sendMailResponse);
      if ("error" in sendMailResponse["results"][0]) {
        handleSendMailResponse({ status: "error" }, sendingAnimation);
      } else {
        handleSendMailResponse({ status: "success" }, sendingAnimation);
      }
      if (sendingAnimation) {
        setTimeout(() => sendingAnimation.remove(), 5000);
      }
    }

    const uploadResponse = await uploadMailData(
      sender,
      uploadId,
      subject,
      body,
      schedule
    );
    if (schedule !== "" && schedule !== "Now") {
      handleUploadResponse(uploadResponse, sendingAnimation);
      setTimeout(() => sendingAnimation.remove(), 4000);
    }
  } catch (error) {
    console.error("Error:", error);
    setTimeout(() => sendingAnimation.remove(), 5000);
    createMsgBox("An Error Occurred. Please check the console for details.");
  } finally {
    try {
      sendingAnimation.classList.remove("sending");
    } catch (e) {
      console.error(e);
    }
  }
}

function createSendingAnimation(msg) {
  const div = document.createElement("div");
  div.innerHTML = `<div class="sending"><p class="send-text">${
    msg || "Sending..."
  }</p></div>`;
  return div;
}
function createMsgBox(msg) {
  const msgBox = document.createElement("div");
  msgBox.classList.add("msg-box");
  msgBox.innerHTML = `<p class="msg-text">${msg || "Unknown Message"}</p>`;
  document.body.appendChild(msgBox);
  setTimeout(() => msgBox.remove(), 5000);
  return msgBox;
}

async function sendEmailRequest(sender, uploadId, subject, body, track) {
  const emails = JSON.parse(sessionStorage.getItem("emails") || "[]");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");

  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));

  return fetch("http://127.0.0.1:5000/send-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject,
      body,
      emails: emailData,
      tracking: track,
    }),
  }).then((res) => res.json());
}

function handleSendMailResponse(response, sendingAnimation) {
  let msg =
    response.status === "success"
      ? "Mail has been sent successfully."
      : "Mail has not been sent. Please try again.";

  sendingAnimation.innerHTML = `
    <div class="ending">
      <p class="ending-text">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 18L12 22L14 18Z"></path>
        </svg>
        ${msg}
      </p>
    </div>
  `;
}

function uploadMailData(sender, uploadId, subject, body, schedule) {
  const emails = JSON.parse(sessionStorage.getItem("emails") || "[]");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const stage1 = JSON.parse(sessionStorage.getItem("stage1") || false);
  const stage2 = JSON.parse(sessionStorage.getItem("stage2") || false);
  const stage3 = JSON.parse(sessionStorage.getItem("stage3") || false);

  if (stage1 || stage2 || stage3) {
    var stageData = JSON.parse(
      sessionStorage.getItem("stagetextarea-values") || "[]"
    );
  } else {
    var stageData = [];
  }
  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));

  return fetch("http://127.0.0.1:5000/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject,
      body,
      emails: emailData,
      date: "currentdate",
      status: "Ready",
      followup: parseInt(sessionStorage.getItem("followup") || 0),
      tracking: JSON.parse(sessionStorage.getItem("tracking") || "false"),
      schedule: schedule,
      stageData: stageData,
      stage1: stage1,
      stage2: stage2,
      stage3: stage3,
    }),
  });
}

function handleUploadResponse(response, sendingAnimation) {
  if (response.ok) {
    console.log("Upload Success:", response);
    var msg = `Mail has been scheduled`;
  } else {
    var msg = `Mail has not been Scheduled`;
    console.log("Upload Failed:", response);
  }
  sendingAnimation.innerHTML = `
    <div class="ending">
      <p class="ending-text">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 18L12 22L14 18Z"></path>
        </svg>
        ${msg}
      </p>
    </div>
  `;
}

function sendTestMail() {
  console.log("Sending Test Email");
  const testEmail = sessionStorage.getItem("test_email");
  const emailData = [
    {
      email: testEmail,
      variables: { name: "Test User" },
    },
  ];

  fetch("http://127.0.0.1:5000/send-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: document.querySelector(".aoT").value,
      body: "This is a test email.",
      emails: emailData,
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
}
