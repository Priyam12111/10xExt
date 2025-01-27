function fetchDataFromSheet() {
  if (!sessionStorage.getItem("spreadsheetId")) {
    sheetListJs();
  }
  const sheetList = document.querySelector(".sheet-list-container");
  const spreadsheetId = sessionStorage.getItem("spreadsheetId");
  const sender = sessionStorage.getItem("sender");
  const sheetName = sessionStorage.getItem("range") || "Sheet1";
  const range = `${sheetName}!A:Z`;
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
        sessionStorage.setItem("variables", JSON.stringify(variables));
        sessionStorage.setItem(
          "emails",
          JSON.stringify(storedData["Email"] || [])
        );
        try {
          if (storedData["Email"] && storedData["Email"].length > 0) {
            setEmailDetails(storedData["Email"], "", "");
          }
        } catch (error) {
          console.log("Error setting email details:", error);
        }
      }
    })
    .catch((error) => {
      createMsgBox("Error fetching data. Please try again.");
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
  const emailField = document.querySelector(".agP");
  const senderField = document.querySelector(".aGb.mS5Pff");

  if (
    emailField &&
    emailField.getAttribute("aria-label") === "To recipients" &&
    senderField.textContent == ""
  ) {
    emailField.focus();
    emailField.value = `${emails.length}-recipients@cmail.in`;
    emailField.dispatchEvent(new Event("input", { bubbles: true }));
    try {
      document.querySelector(".agJ.aFw").click();
    } catch (error) {
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
    if (senderField.textContent == "") {
      createMsgBox(emailDescription);
      const subjectField = document.querySelector(".aoT");
      if (subjectField) {
        subjectField.value +=
          subjectField.getAttribute("aria-label") === "To recipients"
            ? `${emails.length}-recipients@cmail.in`
            : subject;
      }
    }
  }

  const bodyField = document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW");
  if (bodyField) {
    bodyField.innerHTML += body;
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

    // if (schedule === "" || schedule === "Now") {
    //   const sendMailResponse = await sendEmailRequest(
    //     sender,
    //     uploadId,
    //     subject,
    //     body,
    //     track
    //   );
    //   console.log(sendMailResponse);
    //   if (sendingAnimation) {
    //     sendingAnimation.remove();
    //   }
    //   if ("error" in sendMailResponse["results"][0]) {
    //     await handleSendMailResponse({ status: "error" });
    //   } else {
    //     await handleSendMailResponse({ status: "success" });
    //   }
    // }

    console.log("Uploading Mail Data...");
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
    const now = new Date();
    const schedule = sessionStorage.getItem("schedule") || "";
    let current_schedule =
      schedule === ""
        ? formatIST(new Date(now.getTime() + 1 * 60 * 1000))
        : schedule;
    const uploadResponse = await uploadMailData(
      sender,
      uploadId,
      subject,
      body,
      current_schedule,
      DelayCheckbox
    );
    handleUploadResponse(uploadResponse, schedule, DelayCheckbox);
    setTimeout(() => sendingAnimation.remove(), 4000);
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

async function createMsgBox(msg, duration = 3000) {
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
    }, duration);
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
  const followuptime = sessionStorage.getItem("followuptime") || [];
  const range = sessionStorage.getItem("range") || false;
  const draftBodies = ["draftBody1", "draftBody2", "draftBody3"]
    .map((key) => sessionStorage.getItem(key) || "")
    .filter((body) => body.trim() !== "");
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
      range,
      draftBodies,
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
    followuptime = JSON.parse(sessionStorage.getItem("followuptime") || "[]");
    var msg = `Mail has been scheduled for ${schedule} ${
      DelayCheckbox
        ? `with a delay of ${parseInt(DelayCheckbox, 0) * 5} seconds`
        : "immediately"
    }`;
    followuptime.forEach((time, index) => {
      if (time !== "") {
        msg += `\nFollowup ${index + 1} will be sent on ${time} `;
      }
    });
  } else {
    var msg = `Mail has not been Scheduled`;
    console.log("Upload Failed:", response);
  }
  createMsgBox(msg);
}

function sendTestMail(testEmail) {
  console.log("Sending Test Email");
  const emails = [testEmail];
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));
  const sender = sessionStorage.getItem("sender");
  const subject = document.querySelector(".aoT").value || "Testing Subject";
  const body =
    document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW").innerHTML ||
    "Testing Mail Body";
  const uploadId = fetch(`https://acaderealty.com/latest_id?subject=${subject}`)
    .then((res) => res.text())
    .then((id) => JSON.parse(id).Latest_id + 1);
  fetch("https://acaderealty.com/send-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject: subject,
      body: body,
      emails: emailData,
      tracking: false,
      DelayCheckbox: 0,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      createMsgBox(
        `Test mail sent successfully to ${testEmail}. Check your inbox!`
      );
    })
    .catch((error) => {
      console.log("Error:", error);
      createMsgBox(
        `Test mail failed to send to ${testEmail}. Please try again or check your internet connection.`
      );
    });
}
