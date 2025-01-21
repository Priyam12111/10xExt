from flask import Flask, request, send_file
from flask_cors import CORS
import io
from pymongo import MongoClient
from datetime import datetime
from flask import jsonify, redirect
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pymongo import MongoClient
import traceback
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import base64, os, re, json
from time import sleep
from dotenv import load_dotenv
from apscheduler.triggers.date import DateTrigger
from bs4 import BeautifulSoup
from threading import Thread
import logging
from logging import Formatter, FileHandler

load_dotenv(dotenv_path=".env")

app = Flask(__name__)
CORS(app)

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "priyamtomar133@gmail.com"
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD_SMTP", "")


MONGO_URI = os.environ.get("MONGO_URI")
DATABASE_NAME = "Camp"
COLLECTION_NAME = "Maildata"
REPORT = "Report"
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]
report = db[REPORT]


auth_code = ""
app = Flask(__name__)
CORS(app)



try:
    handlers = [
        logging.FileHandler("/home/ubuntu/Gmass/flask.log"),  
        logging.StreamHandler(),  
    ]
except Exception as e:
    handlers = [
        logging.FileHandler("flask.log"),  
        logging.StreamHandler(),  
    ]

logging.basicConfig(
    level=logging.INFO,  
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=handlers,
)


@app.route("/serve", methods=["GET"])
def home():
    app.logger.info("Home route accessed")
    return "Happy to serve"


@app.route("/track")
def track_url():
    
    name = request.args.get("user", "unknown")
    idx = int(request.args.get("id", "0"))
    url = request.args.get("url", "unknown")
    document = report.find_one({"uploadId": idx})

    datetime_object = datetime.now()
    date_key = datetime_object.strftime("%Y-%m-%d")

    if document:
        if "Clicks" in document and f"{name},{url}" not in document["Clicks"]:
            document["Clicks"].append(f"{name},{url}")
        if "Clicks" not in document:
            document["Clicks"] = [f"{name},{url}"]
        if (
            date_key + " Clicks" in document
            and f"{name},{url}" not in document[date_key + " Clicks"]
        ):
            document[date_key + " Clicks"].append(f"{name},{url}")
        if (date_key + " Clicks") not in document:
            document[date_key + " Clicks"] = [f"{name},{url}"]
        report.update_one({"uploadId": idx}, {"$set": document})

    else:
        report.update_one(
            {"uploadId": idx},
            {
                "$set": {
                    date_key + " Clicks": [f"{name},{url}"],
                    "Clicks": [f"{name},{url}"],
                }
            },
            upsert=True,
        )
    original_url = url
    return redirect(original_url.strip('"'))


def monitor_changes():
    app.logger.info("Starting MongoDB change stream...")
    try:
        change_stream = db["Report"].watch()
    except Exception:
        change_stream = None
    if change_stream:
        for change in change_stream:
            app.logger.info(change)
            updated_fields = change.get("updateDescription", {}).get(
                "updatedFields", {}
            )
            newArray = [False, False]
            email_info = None
            for key, value in updated_fields.items():
                if key.startswith("Clicks"):
                    Field = "Clicks"
                    app.logger.info(f"{key}: {value[-1]}")
                    try:
                        email_info = value[-1]
                    except Exception:
                        email_info = value
                    newArray[1] = True
                    break
                elif key.startswith("Opens"):
                    Field = "Opens"
                    app.logger.info(f"{key}: {value[-1]}")
                    try:
                        email_info = value[-1]
                    except Exception:
                        email_info = value
                    newArray[0] = True
                    break
            if updated_fields == {}:
                email_info = change.get("fullDocument", {}).get("Opens", [])
                Field = "Opens"
                app.logger.info(email_info)
            if email_info:
                emails = re.split(r"[,\s]+", str(email_info))
                email = (
                    emails[0].replace("'", "").replace("[", "").replace("]", "")
                    if emails
                    else None
                )
            else:
                email = None
            if email:
                app.logger.info(f"Updating Google Sheets for email: {email}-{Field}")
                uploadId = report.find_one(
                    change.get("documentKey", {}).get("_id"), {"_id": 0, "uploadId": 1}
                ).get("uploadId")
                doc = collection.find_one({"uploadId": uploadId})
                sender = doc.get("sender")
                spreadsheet_id = doc.get("spreadsheetId")
                update_google_sheet(
                    sender,
                    spreadsheet_id,
                    email,
                    Field,
                )
            else:
                app.logger.info("No email found in the updated fields. ")


def start_background_thread():
    thread = Thread(target=monitor_changes)
    thread.daemon = True
    thread.start()


start_background_thread()  


def update_google_sheet(sender, spreadsheet_id, email, field):
    app.logger.info(sender, spreadsheet_id, email, field)
    service = build(
        "sheets",
        "v4",
        credentials=authenticate_gmail(sender.replace("@", "").replace(".com", "")),
    )
    sheet = service.spreadsheets()

    result = (
        sheet.values().get(spreadsheetId=spreadsheet_id, range="Sheet1!1:1").execute()
    )
    headers = result.get("values", [])[0]
    if field not in headers:
        return
    header_opens_index = headers.index(field)

    result = (
        sheet.values().get(spreadsheetId=spreadsheet_id, range="Sheet1!A:Z").execute()
    )
    values = result.get("values", [])

    for row_index, row in enumerate(values):
        if len(row) > 0 and email.lower() in str(row).lower():
            if len(row) <= header_opens_index:
                row.extend([None] * (header_opens_index - len(row) + 1))

            row[header_opens_index] = True

            update_range = f"Sheet1!A{row_index + 1}:Z{row_index + 1}"
            body = {"values": [row]}

            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=update_range,
                valueInputOption="RAW",
                body=body,
            ).execute()
            return

    app.logger.info("Email not found in the sheet.")


@app.route("/create-headers", methods=["GET"])
def create_headers():
    sender = request.args.get("sender")
    spreadsheet_id = request.args.get("spreadsheetId")
    new_headers = request.args.get("newHeaders")
    if not sender or not spreadsheet_id or not new_headers:
        return (
            jsonify(
                {
                    "error": "Missing required parameters. 'sender', 'spreadsheetId', 'newHeaders' are required."
                }
            ),
            400,
        )
    new_headers = new_headers.split(",")
    service = build(
        "sheets",
        "v4",
        credentials=authenticate_gmail(sender.replace("@", "").replace(".com", "")),
    )
    sheet = service.spreadsheets()
    result = (
        sheet.values().get(spreadsheetId=spreadsheet_id, range="Sheet1!1:1").execute()
    )
    current_headers = result.get("values", [])[0] if result.get("values", []) else []
    missing_headers = [
        header for header in new_headers if header not in current_headers
    ]
    if missing_headers:
        updated_headers = current_headers + missing_headers
        body = {"values": [updated_headers]}

        sheet.values().update(
            spreadsheetId=spreadsheet_id,
            range="Sheet1!1:1",
            valueInputOption="RAW",
            body=body,
        ).execute()
        app.logger.info(f"Headers added: {missing_headers}")
    else:
        app.logger.info("No new headers to add. All headers are already present.")
    return jsonify({"status": "success"}), 200


def make_url_tracking(body, idx, to_email):
    soup = BeautifulSoup(body, "html.parser")
    for a_tag in soup.find_all("a", href=True):
        original_url = a_tag["href"]

        if "unsubscribe" in original_url:
            continue

        tracking_url = (
            f"https://acaderealty.com/track?url={original_url}&id={idx}&user={to_email}"
        )
        a_tag["href"] = tracking_url
    return str(soup)


def makeing_unsun_working(body, idx, to_email):
    if "userID=#" in body:
        body = body.replace("userID=#", f"userID={idx}")
    if "Email=#" in body:
        body = body.replace("Email=#", f"Email={to_email}")
    return body


def authenticate_gmail(token, CREDENTIALS_FILE="credentials.json", auth_code=""):
    creds = None
    SCOPES = [
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/spreadsheets",
    ]
    TOKEN_FILE = token.replace("@", "").replace(".com", "") + ".json"
    app.logger.info(f"auth_code: {auth_code}")

    if auth_code != "":
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            scopes=SCOPES,
            redirect_uri="https://klbflhgmkohpdgobojmenojiapdogbgi.chromiumapp.org/",
        )
        flow.fetch_token(code=auth_code)
        creds = flow.credentials
        
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())
            creds_json = json.load(token)
            creds_json["auth_code"] = auth_code
            token.seek(0)
            json.dump(creds_json, token, indent=4)
            token.truncate()
    else:
        with open(TOKEN_FILE, "r") as token:
            creds = Credentials.from_authorized_user_info(
                info=json.load(token), scopes=SCOPES
            )
    return creds


@app.route("/auth", methods=["POST"])
def handle_auth():
    """Endpoint to handle Google authentication."""
    try:
        global auth_code
        data = request.get_json()
        auth_code = data.get("code")
        token = data.get("sender")
        if not auth_code:
            return jsonify({"error": "Authorization code is required"}), 400
        creds = authenticate_gmail(token, auth_code=auth_code)
        return (
            jsonify(
                {"message": "Authenticated successfully", "token": creds.to_json()}
            ),
            200,
        )

    except Exception as e:
        
        return jsonify({"error": str(e)}), 500


def addsTracking(url, to_email, idx, body_template, variables, track):
    if track:
        tracking_pixel_url = f"{url}/track.png?name={to_email}&idx={idx}"
        variables["tracking_pixel_url"] = tracking_pixel_url
        app.logger.info(tracking_pixel_url)
        body_template_plain = (
            body_template
            + """
            <img src="{tracking_pixel_url}" alt="." width="1">
            """
        )
        body = body_template_plain.format(**variables)
    else:
        body = body_template.format(**variables)
    return body


def send_mails_helper_gcp(
    idx,
    emails,
    subject,
    body_template,
    track,
    token_file,
    results,
    max_emails=0,
    delay=0,
    followup=False,
    thread_data=None,
):
    url = "https://acaderealty.com"
    creds = authenticate_gmail(token_file.replace("@", "").replace(".com", ""))
    service = build("gmail", "v1", credentials=creds)
    email_count = 0
    mail_data = []
    thread_idx_2 = None
    for email_data in emails:
        if max_emails != 0 and email_count >= max_emails:
            app.logger.info("Max emails limit reached.")
            break
        try:

            try:
                to_email = email_data["email"]
                variables = email_data.get("variables", {})
            except Exception:
                to_email = email_data
                variables = {"name": "Test"}

            body = makeing_unsun_working(body_template, idx, to_email)
            body = make_url_tracking(body, idx, to_email)
            body = addsTracking(url, to_email, idx, body, variables, track)

            msg = MIMEMultipart()
            msg["From"] = "me"
            msg["To"] = to_email
            msg["Subject"] = subject

            html_body = MIMEText(body, "html")
            msg.attach(html_body)

            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            collection.find_one(sort=[("uploadId", -1)])
            message = {"raw": raw}

            if followup and thread_data:
                app.logger.info("Sending followup mail")
                thread_id = next(
                    (
                        data.split(", ")[1]
                        for data in thread_data
                        if data.split(", ")[0] == to_email
                    ),
                    None,
                )
                new_message = {
                    "raw": raw,
                    "threadId": thread_id,
                }

                response = (
                    service.users()
                    .messages()
                    .send(userId="me", body=new_message)
                    .execute()
                )
            else:
                response = (
                    service.users().messages().send(userId="me", body=message).execute()
                )
            thread_idx_2 = response["threadId"]
            app.logger.info("Mail Sent. Thread ID:", thread_idx_2)
            results.append({"email": to_email, "status": "sent"})
        except HttpError as e:
            app.logger.info("HttpError:", e.response.status_code, e)
            results.append({"email": to_email, "status": "failed", "error": str(e)})
        except Exception as e:
            app.logger.info("Exception:", e)
            results.append({"email": to_email, "status": "failed", "error": str(e)})
        if thread_idx_2:
            mail_data.append(f"{to_email}, {thread_idx_2}")
        email_count += 1
        delay_durations = {1: 7, 2: 20, 3: 120, 4: 300}
        if delay > 0:
            sleep(delay_durations.get(delay, 0))
        app.logger.info("Uploading thread ID to the database", thread_idx_2)
    if thread_idx_2:
        collection.update_one(
            {"uploadId": idx},
            {"$set": {"thread_data": mail_data, "last_sent": datetime.now()}},
        )

    return results


def schedule():
    collection = db[COLLECTION_NAME]
    today = datetime.now().date()
    documents = collection.find(
        {
            "schedule": {"$exists": True, "$ne": None},
        }
    )
    result = []

    for doc in documents:
        if doc["schedule"] != "Executed" and doc["schedule"] != "":
            app.logger.info(
                doc["schedule"].time() <= datetime.now().time(),
                doc["schedule"],
                datetime.now().time(),
            )
        if (
            doc["schedule"] != "Executed"
            and doc["schedule"] != ""
            and doc["schedule"].date() == today
            and doc["schedule"].hour == datetime.now().hour
            and doc["schedule"].minute <= datetime.now().minute
        ):
            emails = doc["emails"]
            subject = doc["subject"]
            body = doc["body"]
            tracking = doc["tracking"]
            delay = doc["DelayCheckbox"]
            send_mails_helper_gcp(
                doc["uploadId"],
                emails,
                subject,
                body,
                tracking,
                f'{doc["sender"].replace("@", "").replace(".com", "")}',
                result,
                delay=delay,
            )
            if doc["status"][0] == "R":
                newStatus = "1 follow up"
            else:
                newStatus = str(int(doc["status"][0]) + 1) + " follow up"
                if newStatus[0] == "4":
                    newStatus = "Completed"
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"status": newStatus, "schedule": "Executed"}},
            )


def followUpSchedule():
    collection = db[COLLECTION_NAME]
    today = datetime.now().date()
    documents = collection.find(
        {
            "$or": [
                {"stage1": {"$exists": True, "$ne": None}},
                {"stage2": {"$exists": True, "$ne": None}},
                {"stage3": {"$exists": True, "$ne": None}},
            ]
        }
    )

    result = []
    for doc in documents:
        for i, stage in enumerate(["stage1", "stage2", "stage3"]):
            if (
                stage in doc
                and doc[stage] != False
                and doc[stage] != "Executed"
                and doc["status"] != "Completed"
                and doc[stage].date() == today
            ):
                processFollowUp(doc, i, stage, result)

    return result


def processFollowUp(doc, i, stage, result):
    app.logger.info(
        f"Processing {stage} for document ID {doc['_id']} on {datetime.now().date()}"
    )

    emails = doc["emails"]
    if i < len(doc["stageData"]):
        subject = " Followup For " + doc["subject"]
    else:
        subject = f"Followup For {doc['subject']}"
    try:
        body = doc["stageData"][i] + "Follow up body Mail to " + doc["body"]
    except Exception:
        body = "Follow up body Mail to " + doc["body"]
    tracking = doc["tracking"]
    try:
        thread_data_idx = doc["thread_data"]
    except Exception:
        thread_data_idx = None
    app.logger.info("Thread data:", thread_data_idx)
    send_mails_helper_gcp(
        doc["uploadId"],
        emails,
        subject,
        body,
        tracking,
        f'{doc["sender"].replace("@", "").replace(".com", "")}',
        result,
        thread_data=thread_data_idx,
        followup=True,
        delay=doc["DelayCheckbox"],
    )
    if doc["status"][0] == "R":
        newStatus = "1 follow up"
    else:
        newStatus = str(int(doc["status"][0]) + 1) + " follow up"
        if newStatus[0] == "4":
            newStatus = "Completed"
    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"status": newStatus, stage: "Executed"}},
    )


def timeSchedule(year=None, month=None, day=None, hours=None, minutes=None):
    try:
        now = datetime.now()

        year = year or now.year
        month = month or now.month
        day = day or now.day
        hours = hours if hours is not None else now.hour
        minutes = minutes if minutes is not None else now.minute

        scheduler = BackgroundScheduler()
        scheduler.start()

        trigger = DateTrigger(run_date=datetime(year, month, day, hours, minutes))

        scheduler.add_job(
            func=schedule,
            trigger=trigger,
            id=f"Job_fixing_{year}_{month}_{day}_{hours}_{minutes}",
            replace_existing=True,
        )
        app.logger.info(f"Job scheduled for {year}-{month}-{day} at {hours}:{minutes}.")
    except Exception as e:
        app.logger.info(f"An error occurred while scheduling: {e}")


def followbackSchedule(year=None, month=None, day=None, hours=None, minutes=None):
    try:
        now = datetime.now()

        year = year or now.year
        month = month or now.month
        day = day or now.day
        hours = hours if hours is not None else now.hour
        minutes = minutes if minutes is not None else now.minute

        scheduler = BackgroundScheduler()
        scheduler.start()

        trigger = DateTrigger(run_date=datetime(year, month, day, hours, minutes))

        scheduler.add_job(
            func=followUpSchedule,
            trigger=trigger,
            id=f"Job_fixing_{year}_{month}_{day}_{hours}_{minutes}",
            replace_existing=True,
        )
        app.logger.info(
            f"Followup scheduled for {year}-{month}-{day} at {hours}:{minutes}."
        )
    except Exception as e:
        app.logger.info(f"An error occurred while scheduling: {e}")


@app.route("/schedule", methods=["GET"])
def schedule_job():
    try:
        schedule()
    except Exception as e:
        app.logger.info("Schedule Error:", e)
        return jsonify({"status": "Checking Failed"}), 500
    return "success", 200


@app.route("/followUpschedule", methods=["GET"])
def follow_job():
    try:
        followUpSchedule()
    except Exception as e:
        app.logger.error(e)
        return jsonify({"status": "Checking Failed"}), 500
    return "success", 200


@app.route("/timeSchedule", methods=["GET"])
def timeSchedule_job():
    hours = int(request.args.get("hours"))
    minutes = int(request.args.get("minute"))
    timeSchedule(hours, minutes)
    return "success", 200


@app.route("/list-sheets", methods=["GET"])
def list_google_sheets():
    sender = request.args.get("sender")
    try:
        cred = authenticate_gmail(sender.replace("@", "").replace(".com", ""))
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": "Authentication failed"}), 403

    service = build("drive", "v3", credentials=cred)
    results = (
        service.files()
        .list(
            q="mimeType='application/vnd.google-apps.spreadsheet'",
            fields="nextPageToken, files(id, name,createdTime)",
        )
        .execute()
    )
    sheets = results.get("files", [])
    if not sheets:
        app.logger.info("No Google Sheets files found.")
    else:
        result = []
        for sheet in sheets:
            result.append(
                {
                    "name": sheet["name"],
                    "id": sheet["id"],
                    "createdTime": sheet["createdTime"],
                }
            )
    return jsonify({"status": "success", "result": result}), 200


@app.route("/sheet-data", methods=["GET"])
def get_sheet_data():
    sender = request.args.get("sender")
    spreadsheet_id = request.args.get("spreadsheetId")
    range_name = request.args.get("range")

    try:
        cred = authenticate_gmail(sender.replace("@", "").replace(".com", ""))
    except Exception as e:
        app.logger.info(f"Authentication error: {e}")
        return jsonify({"error": "Authentication failed"}), 403

    try:
        service = build("sheets", "v4", credentials=cred)
        sheet = service.spreadsheets()
        result = (
            sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
        )
        rows = result.get("values", [])
    except Exception as e:
        app.logger.info(f"An error occurred while fetching data: {e}")
        return jsonify({"error": "Failed to fetch sheet data"}), 500

    if not rows or not isinstance(rows, list) or len(rows) < 1:
        app.logger.info("No data found or invalid sheet structure.")
        return jsonify({"error": "No data found"}), 400

    headers = rows[0]
    if not any("email" in header.lower() for header in headers):
        app.logger.info("No 'Email' column found in the sheet.")
        return jsonify({"error": "No 'Email' column in the sheet"}), 400

    return jsonify({"values": rows}), 200


@app.route("/send-mails", methods=["POST"])
def send_mails():
    try:
        data = request.json
        sender = data.get("sender")
        idx = data.get("uploadId", 0)
        subject = data.get("subject")
        body_template = data.get("body")
        track = data.get("tracking")
        emails = data.get("emails", [])
        delay = data.get("DelayCheckbox", 0)
        existing_subject = collection.find_one({"subject": subject})
        if existing_subject:
            idx = existing_subject.get("uploadId", 0)
        if not sender or not subject or not body_template or not emails:
            return (
                jsonify({"status": "error", "message": "Missing required fields"}),
                400,
            )
        results = []
        try:

            send_mails_helper_gcp(
                idx,
                emails,
                subject,
                body_template,
                track,
                f'{sender.replace("@", "").replace(".com", "")}',
                results,
                delay=delay,
            )
        except Exception:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Token {sender.replace('@','')}.json file not found",
                    }
                ),
                500,
            )
        return jsonify({"status": "success", "results": results}), 200

    except Exception as e:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "traceback": traceback.format_exc(),
                }
            ),
            500,
        )


@app.route("/upload", methods=["POST"])
def upload_to_mongodb():
    data = request.json
    try:
        if "subject" in data:
            existing_subject = collection.find_one({"subject": data["subject"]})
            if existing_subject:
                collection.delete_one({"subject": data["subject"]})
                data["uploadId"] = existing_subject.get("uploadId", 0)
        if "date" in data:
            data["date"] = datetime.now()

        if (
            "schedule" in data
            and data["schedule"] != ""
            and data["schedule"] != "Executed"
        ):
            data["schedule"] = datetime.strptime(data["schedule"], "%d/%m/%Y, %I:%M %p")
            timeSchedule(hours=data["schedule"].hour, minutes=data["schedule"].minute)
            app.logger.info("Timing has been set to ", data["schedule"])

        for stage in ["stage1", "stage2", "stage3"]:
            if stage in data and (type(data[stage]) != bool):
                app.logger.info(f"\nSetting up schedule for {stage}")
                if data[stage] == 0:
                    hour, minute = map(int, data["followuptime"].split(":"))
                    now = datetime.now()
                    followup_time = now.replace(
                        hour=hour, minute=minute, second=0, microsecond=0
                    )
                    if followup_time < now:
                        followup_time += timedelta(days=1)
                    data[stage] = followup_time
                else:
                    data[stage] = datetime.now() + timedelta(days=int(data[stage]))
                followbackSchedule(
                    data[stage].year,
                    data[stage].month,
                    data[stage].day,
                    data[stage].hour,
                    data[stage].minute,
                )
                app.logger.info(f"Followup has been set to {data[stage]}")

        result = collection.insert_one(data)
        return jsonify({"status": "success", "inserted_id": str(result.inserted_id)})
    except Exception as e:
        app.logger.info("Upload Error: ", e)
        return jsonify({"status": "failed", "error": str(e)}), 500


@app.route("/latest_id", methods=["GET"])
def get_latest_id():
    subject = request.args.get("subject")
    if subject:
        latest_document = collection.find_one(
            {"subject": subject}, sort=[("uploadId", -1)]
        )
        if not latest_document:
            latest_document = collection.find_one(sort=[("uploadId", -1)])
    else:
        latest_document = collection.find_one(sort=[("uploadId", -1)])
    if latest_document:
        return jsonify({"Latest_id": latest_document.get("uploadId", 0)})
    else:
        return jsonify({"Latest_id": 0})


@app.route("/isUserSigned", methods=["GET"])
def isUserSigned():
    user = request.args.get("user")
    if user:
        token_file = f"{user.replace('@', '').replace('.com', '')}.json"
        return (
            jsonify({"status": "success", "isSignedIn": os.path.exists(token_file)}),
            200,
        )
    else:
        return "Invalid parameters", 400


@app.route("/unsubscribe", methods=["GET"])
def unsubscribe():
    userID = request.args.get("userID")
    Email = request.args.get("Email")

    if not userID or not Email:
        return (
            jsonify(
                {"error": "Missing parameters. 'userID' and 'Email' are required."}
            ),
            400,
        )

    try:
        userID = int(userID)
    except ValueError:
        return jsonify({"error": "'userID' must be a valid integer."}), 400

    document = collection.find_one({"uploadId": userID})

    if not document:
        return jsonify({"error": "No document found for the given 'userID'."}), 404

    unsubscribe = document.get("unsubscribe", [])

    if Email not in unsubscribe:
        collection.update_one({"uploadId": userID}, {"$push": {"unsubscribe": Email}})
        return jsonify({"message": "Email successfully unsubscribed."}), 200
    else:
        return jsonify({"message": "Email is already unsubscribed."}), 200


@app.route("/drafts", methods=["GET"])
def get_drafts():
    sender = request.args.get("sender")
    if not sender:
        return jsonify({"error": "Missing 'sender' parameter."}), 400

    try:
        service = build(
            "gmail",
            "v1",
            credentials=authenticate_gmail(sender.replace("@", "").replace(".com", "")),
        )
        query = "to:developer@cmail.com"  
        results = (
            service.users().drafts().list(userId="me", maxResults=10, q=query).execute()
        )
        drafts = results.get("drafts", [])

        if not drafts:
            return (
                jsonify({"message": "No drafts found for the specified recipient."}),
                200,
            )

        drafts_list = []
        for draft in drafts:
            draft_id = draft["id"]
            draft_data = (
                service.users().drafts().get(userId="me", id=draft_id).execute()
            )
            message = draft_data["message"]
            drafts_list.append(
                {"draft_id": draft_id, "snippet": message.get("snippet")}
            )
        return jsonify({"drafts": drafts_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/create_draft", methods=["POST"])
def create_draft():
    sender = request.json.get("sender")
    recipient = request.json.get("recipient")
    subject = request.json.get("subject", "No Subject")
    body = request.json.get("body", "")

    if not sender or not recipient:
        return jsonify({"error": "Missing 'sender' or 'recipient' parameter."}), 400

    try:
        service = build(
            "gmail",
            "v1",
            credentials=authenticate_gmail(sender.replace("@", "").replace(".com", "")),
        )

        
        message = {
            "raw": base64.urlsafe_b64encode(
                f"To: {recipient}\r\n"
                f"Subject: {subject}\r\n\r\n"
                f"{body}".encode("utf-8")
            ).decode("utf-8")
        }

        
        draft = (
            service.users()
            .drafts()
            .create(userId="me", body={"message": message})
            .execute()
        )

        return (
            jsonify(
                {"message": "Draft created successfully.", "draft_id": draft["id"]}
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
