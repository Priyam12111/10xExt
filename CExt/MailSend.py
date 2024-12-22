from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Configure your SMTP settings
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "priyamtomar133@gmail.com"  # Replace with your email
EMAIL_PASSWORD = "jlhgfyhjzbfngqac"  # Replace with your app password


@app.route("/send-mails", methods=["POST"])
def send_mails():
    data = request.json  # Expecting JSON input

    # Validate input
    if (
        not data
        or "emails" not in data
        or "subject" not in data
        or "body" not in data
        or "tracking" not in data
    ):
        return (
            jsonify(
                {
                    "error": "Invalid input, 'emails', 'subject', tracking,and 'body' keys are required"
                }
            ),
            400,
        )

    emails = data["emails"]
    subject = data["subject"]
    body_template = data["body"]
    track = data["tracking"]
    results = []
    print(track)
    if track == True:
        body_template += """
        <p>\n\nThis email is tracked by MailSend API<p>
        <img src="{tracking_pixel_url}" alt="." width="1">
        """
    for email_data in emails:
        try:
            # Extract email details
            to_email = email_data["email"]
            variables = email_data.get("variables", {})

            # Customize email body
            tracking_pixel_url = (
                f"https://priyam144.pythonanywhere.com/track.png?name={email_data}"
            )
            variables["tracking_pixel_url"] = tracking_pixel_url
            body = body_template.format(**variables)

            # Create email
            msg = MIMEMultipart()
            msg["From"] = EMAIL_ADDRESS
            msg["To"] = to_email
            msg["Subject"] = subject

            # Attach email body
            html_body = MIMEText(body, "html")
            html_body.add_header(
                "Content-Disposition", "inline"
            )  # Prevents "noname" issue
            msg.attach(html_body)

            # Send email
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())

            results.append({"email": to_email, "status": "sent"})

        except Exception as e:
            results.append(
                {
                    "email": email_data.get("email", "unknown"),
                    "status": f"failed: {str(e)}",
                }
            )

    return jsonify({"results": results}), 200


if __name__ == "__main__":
    app.run(debug=True)
