from google_auth_oauthlib.flow import InstalledAppFlow
import os


def authenticate_and_save_token(client_secrets_file, token_file):
    """
    Authenticate the user and save the token for future use.
    Args:
        client_secrets_file: Path to the OAuth2 client secrets file.
        token_file: Path to save the token.json file.
    """
    # Define the required scopes
    SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

    # Authenticate the user
    flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, SCOPES)
    creds = flow.run_local_server(port=0)

    # Save the credentials to token.json
    with open(token_file, "w") as token:
        token.write(creds.to_json())
    print(f"Token saved to {token_file}")


# Run the function
authenticate_and_save_token("credentials.json", "token.json")
