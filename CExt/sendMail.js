function fetchDataFromSheet() {
  const spreadsheetId =
    localStorage.getItem("spreadsheetId") || prompt("Enter the Spreadsheet ID");
  if (spreadsheetId) {
    localStorage.setItem("spreadsheetId", spreadsheetId);
  }

  const range = "Sheet1!A:Z";
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  const apiKey = "AIzaSyC7Ubf5000J30CudwmIaxIgSz-vhJhe3-A";

  fetch(`${endpoint}?key=${apiKey}`)
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
      alert("Remove Restricted Access to the Spreadsheet");
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
        if (header !== "Email") {
          variables[header] = variables[header] || [];
          variables[header].push(row[index]);
        } else {
          storedData[header] = storedData[header] || [];
          storedData[header].push(row[index]);
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
  const sendingAnimation = createSendingAnimation();
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

    const sendMailResponse = await sendEmailRequest(
      sender,
      uploadId,
      subject,
      body,
      track
    );
    handleSendMailResponse(sendMailResponse, sendingAnimation);

    const uploadResponse = await uploadMailData(
      sender,
      uploadId,
      subject,
      body
    );
    handleUploadResponse(uploadResponse);

    setTimeout(() => sendingAnimation.remove(), 5000);
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred!");
  } finally {
    console.log("Removing sending animation");
    try {
      sendingAnimation.classList.remove("sending");
    } catch (e) {
      console.error(e);
    }
  }
}

function createSendingAnimation() {
  const div = document.createElement("div");
  div.innerHTML = `<div class="sending"><p class="send-text">Sending</p></div>`;
  return div;
}

function sendEmailRequest(sender, uploadId, subject, body, track) {
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

function uploadMailData(sender, uploadId, subject, body) {
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
    }),
  });
}

function handleUploadResponse(response) {
  if (response.status === "success") {
    console.log("Upload Success:", response);
  } else {
    console.log("Upload Failed:", response);
  }
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
