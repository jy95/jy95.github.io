/**
 * Sample Node.js code for youtubeAnalytics.reports.query
 * See instructions for running these code samples locally:
 * https://developers.google.com/explorer-help/code-samples#nodejs
 */

import { readFile } from "fs/promises";
import { createWriteStream } from "fs";
import { google } from "googleapis";
import input from '@inquirer/input';

const scope = ["https://www.googleapis.com/auth/youtube.readonly"];
const START_DATE = "2023-09-01";
const END_DATE = "2024-03-31";
const MAX_RESULTS = 50;

// Load client secrets from a local file.
// https://stackoverflow.com/a/52222827/6149867
const content = await readFile("YOUR_CLIENT_SECRET_FILE.json");

// Authorize a client with credentials, then make API call.
const credentials = JSON.parse(content);
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scope
});

console.log(authUrl);
const authMessage = `Visit the URL above to authorize this app`;
const code = await input({ message: authMessage });

oAuth2Client.getToken(code, (err, token) => {
  if (err) return callApi(err);
  oAuth2Client.setCredentials(token);
  callApi(oAuth2Client);
});

// What to do with result


/**
 * Define and execute the API request.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const callApi = async (auth) => {
  const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

  try {
    const response = await youtubeAnalytics.reports.query({
      dimensions: "playlist",
      ids: "channel==MINE",
      maxResults: MAX_RESULTS,
      metrics: "views,estimatedMinutesWatched",
      sort: "-estimatedMinutesWatched",
      startDate: START_DATE,
      endDate: END_DATE
    });

    const rows = response.data.rows || [];

    if (rows.length > 0) {
      const filePath = "playlists_stats.csv";
      const stream = createWriteStream(filePath);

      // Write headers to the stream
      stream.write("Playlist,Title,Views,WatchTime (minutes)\n");

      for (const row of rows) {
        const [playListId, views, watchTime] = row;
        
        // Write each row to the stream
        // TODO have to find a way to retrive title of playlist
        stream.write(`${playListId},"${playListId}",${views},${watchTime}\n`);
      }

      // Close the stream and indicate completion
      stream.end(() => {
        console.log("Data written to playlists_stats.csv successfully.");
      });

    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.log("The API returned an error: ", error.errors);
  }
};