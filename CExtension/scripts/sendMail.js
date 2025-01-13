function fetchDataFromSheet() {
  if (!sessionStorage.getItem("spreadsheetId")) {
    sheetListJs();
  }
  const sheetList = document.querySelector(".sheet-list-container");
  const spreadsheetId = sessionStorage.getItem("spreadsheetId");
  const sender = sessionStorage.getItem("sender");
  const range = "Sheet1!A:Z";
  const endpoint = `https://acaderealty.com/sheet-data?sender=${sender}&spreadsheetId=${spreadsheetId}&range=${range}`;
  if (!spreadsheetId) {
    sheetList.classList.remove("hidden");
    return;
  }

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
        const Subject = localStorage.getItem("Subject") || "Test Email";
        const emailBody =
          localStorage.getItem("EmailBody") || "Hello, Test Emails!";

        sessionStorage.setItem("variables", JSON.stringify(variables));
        sessionStorage.setItem(
          "emails",
          JSON.stringify(storedData["Email"] || [])
        );
        if (storedData["Email"] && storedData["Email"].length > 0) {
          setEmailDetails(storedData["Email"], Subject, emailBody);
        }
      }
    })
    .catch((error) => {
      console.log("Error fetching data:", error);
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
  if (emailField && emailField.getAttribute("aria-label") === "To recipients") {
    emailField.focus();
    emailField.value = `${emails.length}-recipients@cmail.in`;
    emailField.dispatchEvent(new Event("input", { bubbles: true }));
    try {
      document.querySelector(".agJ.aFw").click();
    } catch (error) {
      console.log("Error clicking on send button:", error);
      setTimeout(() => {
        try {
          document.querySelector(".agJ.aFw").click();
        } catch (error) {
          console.log("Error clicking on send button after retry:", error);
        }
      }, 1000);
    }
    const emailDescription = `Emails: ${emails.slice(0, 3).join(", ")}${
      emails.length > 3 ? ", ..." : ""
    } | Total: ${emails.length}`;
    createMsgBox(emailDescription);
    const subjectField = document.querySelector(".aoT");
    if (subjectField) {
      subjectField.value =
        subjectField.getAttribute("aria-label") === "To recipients"
          ? `${emails.length}-recipients@cmail.in`
          : subject;
    }
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
  const DelayCheckbox = sessionStorage.getItem("DelayCheckbox") || 0;
  const sendingAnimation = createSendingAnimation("Processing...");
  document.body.appendChild(sendingAnimation);

  try {
    const sender = sessionStorage.getItem("sender");
    const subject = document.querySelector(".aoT").value;
    const uploadId = await fetch(
      `https://acaderealty.com/latest_id?subject=${subject}`
    )
      .then((res) => res.text())
      .then((id) => JSON.parse(id).Latest_id + 1);
    const body = document.querySelector(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    ).innerHTML;
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
      if (sendingAnimation) {
        sendingAnimation.remove();
      }
      if ("error" in sendMailResponse["results"][0]) {
        await handleSendMailResponse({ status: "error" });
      } else {
        await handleSendMailResponse({ status: "success" });
      }
    }

    console.log("Uploading Mail Data...");
    const uploadResponse = await uploadMailData(
      sender,
      uploadId,
      subject,
      body,
      schedule,
      DelayCheckbox
    );
    if (schedule !== "" && schedule !== "Now") {
      handleUploadResponse(uploadResponse, schedule, DelayCheckbox);
      setTimeout(() => sendingAnimation.remove(), 4000);
    }
  } catch (error) {
    console.log("Error:", error);
    setTimeout(() => sendingAnimation.remove(), 5000);
    createMsgBox("An Error Occurred. Please check the console for details.");
  } finally {
    try {
      sendingAnimation.classList.remove("sending");
    } catch (e) {
      console.log(e);
    }
  }
}

function createSendingAnimation(msg) {
  const div = document.createElement("div");
  div.classList.add("sending-animation-container");
  div.innerHTML = `
    <div class="sending-animation">
      <p class="send-text">${msg || "Sending..."}</p>
      <div class="loading-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  `;
  document.body.appendChild(div);
  return div;
}

async function createMsgBox(msg) {
  return new Promise((resolve) => {
    const msgBox = document.createElement("div");
    msgBox.classList.add("msg-box");
    msgBox.innerHTML = `
      <p class="msg-title">Notification</p>
      <p class="msg-text">${msg || "Unknown Message"}</p>
    `;
    document.body.appendChild(msgBox);
    setTimeout(() => {
      msgBox.remove();
      resolve();
    }, 3000);
  });
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

  return fetch("https://acaderealty.com/send-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject,
      body,
      emails: emailData,
      tracking: track,
      DelayCheckbox: parseInt(sessionStorage.getItem("DelayCheckbox") || 0),
    }),
  }).then((res) => res.json());
}
async function handleSendMailResponse(response) {
  let msg =
    response.status === "success"
      ? "Mail has been sent successfully."
      : "Mail has not been sent. Please try again.";

  await createMsgBox(msg);
}

function uploadMailData(
  sender,
  uploadId,
  subject,
  body,
  schedule,
  DelayCheckbox
) {
  const emails = JSON.parse(sessionStorage.getItem("emails") || "[]");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const stage1 = JSON.parse(sessionStorage.getItem("stage1") || false);
  const stage2 = JSON.parse(sessionStorage.getItem("stage2") || false);
  const stage3 = JSON.parse(sessionStorage.getItem("stage3") || false);
  const spreadsheetId = sessionStorage.getItem("spreadsheetId") || false;
  const SendDaysOn = JSON.parse(sessionStorage.getItem("SendDaysOn") || false);
  const followuptime = sessionStorage.getItem("followuptime") || false;

  let checkedDays, stageData;
  if (SendDaysOn) {
    checkedDays = JSON.parse(sessionStorage.getItem("checkedDays") || "[]");
  } else {
    checkedDays = [];
  }
  if (
    typeof stage1 === "number" ||
    typeof stage2 === "number" ||
    typeof stage3 === "number"
  ) {
    console.log(
      "Getting Stage Value",
      sessionStorage.getItem("stagetextarea-values")
    );
    stageData = JSON.parse(
      sessionStorage.getItem("stagetextarea-values") || "[]"
    );
  } else {
    stageData = [];
  }
  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));

  return fetch("https://acaderealty.com/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject,
      body,
      schedule,
      stageData,
      stage1,
      stage2,
      stage3,
      checkedDays,
      spreadsheetId,
      emails: emailData,
      date: "currentdate",
      status: "Ready",
      followuptime: followuptime,
      tracking: JSON.parse(sessionStorage.getItem("tracking") || false),
      MaxEmails: parseInt(sessionStorage.getItem("MaxEmails") || 0),
      DelayCheckbox: parseInt(DelayCheckbox),
    }),
  });
}

function handleUploadResponse(response, schedule, DelayCheckbox) {
  if (response.ok) {
    console.log("Upload Success:", response);
    var msg = `Mail has been scheduled for ${schedule} ${
      DelayCheckbox ? `with a delay of ${DelayCheckbox} seconds` : "immediately"
    }`;
  } else {
    var msg = `Mail has not been Scheduled`;
    console.log("Upload Failed:", response);
  }
  createMsgBox(msg);
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

  fetch("https://acaderealty.com/send-mails", {
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
      console.log("Error:", error);
      alert("Test Mail Not Sent!");
    });
}
