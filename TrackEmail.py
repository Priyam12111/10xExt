import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Email details
from_email = "priyamtomar133@gmail.com"
to_email = "priyamtomar012@gmail.com"
subject = "Track Email Read Status"
tracking_pixel_url = f"https://priyam144.pythonanywhere.com/track.png?name={to_email}"

# Create the email
msg = MIMEMultipart("alternative")
msg["Subject"] = subject
msg["From"] = from_email
msg["To"] = to_email

# Email body with tracking pixel
html_body = f"""
<html>
<body>
    <p>The below image is begin to be tracked</p>
    <img src="{tracking_pixel_url}" alt="." width="1">
</body>
</html>
"""

msg.attach(MIMEText(html_body, "html"))

with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()
    server.login(from_email, "jlhgfyhjzbfngqac")
    server.sendmail(from_email, to_email, msg.as_string())
    print("Sent!")
