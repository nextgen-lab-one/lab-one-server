const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const ErrorObject = require("../error");

const meetLinkSender = (emails, startTime, endTime, next) => {
  // If modifying these scopes, delete token.json.
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = path.join(
    process.cwd(),
    "/utils/google-calender/token.json"
  );
  const CREDENTIALS_PATH = path.join(
    process.cwd(),
    "/utils/google-calender/credentials.json"
  );

  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
  async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  async function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    const event = {
      summary: "Lab-One HMO session",
      location: "Virtual / Google Meet",
      description:
        "Enjoy Your Life ??? We'll Be Here to Save it! We care for you ??? inside and out!",
      start: {
        dateTime: startTime,
        timeZone: "Africa/Lagos",
      },
      end: {
        dateTime: endTime,
        timeZone: "Africa/Lagos",
      },
      // recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
      attendees: emails,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
          requestId: "coding-calendar-demo",
        },
      },
    };
    calendar.events.insert(
      {
        auth: auth,
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      },
      function (err, event) {
        if (err) {
          return next(new ErrorObject("Error while sending meet link", 400));
        }
      }
    );
  }
  authorize().then(listEvents).catch(console.error);
};

module.exports = meetLinkSender;
