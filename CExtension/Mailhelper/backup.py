import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Define the required scopes for accessing Google Drive
SCOPES = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]


def authenticate_and_build_service():
    """Authenticate and create the Google Drive API service."""
    creds = None
    token_file = "priyamtomar133gmail.json"
    credentials_file = "credentials.json"

    if os.path.exists(token_file):
        creds = Credentials.from_authorized_user_file(token_file)
        if not creds or not creds.has_scopes(SCOPES):
            print(
                "Existing token does not have the required scopes. Re-authenticating..."
            )
            creds = None
        else:
            print(creds.scopes)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_file, "w") as token:
            token.write(creds.to_json())

    # Build the service object
    # service = build("drive", "v3", credentials=creds)
    return creds


def list_google_sheets(service):
    """List all Google Sheets files in Google Drive."""
    results = (
        service.files()
        .list(
            q="mimeType='application/vnd.google-apps.spreadsheet'",
            fields="nextPageToken, files(id, name)",
        )
        .execute()
    )
    sheets = results.get("files", [])
    if not sheets:
        print("No Google Sheets files found.")
    else:
        print("Google Sheets files:")
        for sheet in sheets:
            print(f"{sheet['name']} ({sheet['id']})")


def send_mails_helper(idx, emails, subject, body_template, track, results=[]):
    for email_data in emails:
        try:

            try:
                to_email = email_data["email"]
                variables = email_data.get("variables", {})
            except Exception:
                to_email = email_data
                variables = {"name": "Test"}
            url = "http://15.207.71.80"

            if track:
                tracking_pixel_url = f"{url}/track.png?name={to_email}&idx={idx}"
                variables["tracking_pixel_url"] = tracking_pixel_url
                body_template_plain = (
                    body_template
                    + """
                <p>\n\nThis email is tracked by MailSend API<p>
                <img src="{tracking_pixel_url}" alt="." width="1">
                """
                )
                body = body_template_plain.format(**variables)
            else:
                body = body_template.format(**variables)

            msg = MIMEMultipart()
            msg["From"] = EMAIL_ADDRESS
            msg["To"] = to_email
            msg["Subject"] = subject

            html_body = MIMEText(body, "html")
            html_body.add_header("Content-Disposition", "inline")
            msg.attach(html_body)

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())

            results.append({"email": to_email, "status": "sent"})
        except Exception as e:
            results.append(
                {"email": email_data["email"], "status": "failed", "error": str(e)}
            )


if __name__ == "__main__":
    service = authenticate_and_build_service()
    list_google_sheets(service)
