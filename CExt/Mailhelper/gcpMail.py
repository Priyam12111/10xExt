from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64
from email.mime.text import MIMEText


def send_mail(sender, to, subject, message_text, credentials_file):
    """
    Create and send an email message.
    Args:
        sender: Email address of the sender.
        to: Email address of the receiver.
        subject: The subject of the email message.
        message_text: The text of the email message.
        credentials_file: Path to the credentials.json file.
    """
    try:
        # Load credentials
        credentials = Credentials.from_authorized_user_file(credentials_file)

        # Build the Gmail service
        service = build("gmail", "v1", credentials=credentials)

        # Create the message
        message = create_message(sender, to, subject, message_text)

        # Send the email
        sent_message = (
            service.users().messages().send(userId="me", body=message).execute()
        )
        print(f"Message sent successfully: {sent_message['id']}")

    except HttpError as error:
        print(f"An error occurred: {error}")


def create_message(sender, to, subject, message_text):
    """
    Create a message for an email.
    Args:
        sender: Email address of the sender.
        to: Email address of the receiver.
        subject: The subject of the email message.
        message_text: The text of the email message.
    Returns:
        An object containing a base64url encoded email object.
    """
    message = MIMEText(message_text)
    message["to"] = to
    message["from"] = sender
    message["subject"] = subject
    return {"raw": base64.urlsafe_b64encode(message.as_bytes()).decode()}


# Call the function
# Ensure `credentials.json` is the OAuth2 credentials file for Gmail API.
send_mail(
    sender="priyamtomar133@gmail.com",
    to="priyamtomar012@gmail.com",
    subject="Test",
    message_text="Hello",
    credentials_file=r"token.json",
)
