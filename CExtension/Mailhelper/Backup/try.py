from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os
import json

app = Flask(__name__)
CORS(app)

# Scopes required for the application
SCOPES = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/spreadsheets",
]

# Credentials file (downloaded from Google Cloud Console)
CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.json"


def authenticate_gmail(auth_code):
    """Authenticate Gmail using an authorization code."""
    creds = None
    if auth_code:
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE,
            scopes=SCOPES,
            redirect_uri="https://klbflhgmkohpdgobojmenojiapdogbgi.chromiumapp.org/",
        )
        flow.fetch_token(code=auth_code)
        creds = flow.credentials

        # Save the credentials for future use
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return creds


@app.route("/auth", methods=["POST"])
def handle_auth():
    """Endpoint to handle Google authentication."""
    try:
        # Extract authorization code from the request
        data = request.get_json()
        auth_code = data.get("code")

        if not auth_code:
            return jsonify({"error": "Authorization code is required"}), 400

        # Authenticate using the provided auth code
        creds = authenticate_gmail(auth_code)

        # Return success response
        return (
            jsonify(
                {"message": "Authenticated successfully", "token": creds.to_json()}
            ),
            200,
        )

    except Exception as e:
        # Handle errors
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
