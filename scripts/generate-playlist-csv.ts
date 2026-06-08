/**
 * Sample Node.js code for youtubeAnalytics.reports.query
 * See instructions for running these code samples locally:
 * https://developers.google.com/explorer-help/code-samples#nodejs
 */

import { readFile } from "fs/promises";
import { createWriteStream } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { google } from "googleapis";
import input from '@inquirer/input';
import Database from 'better-sqlite3';

// Importation de la fonction et du type depuis findPublishedGames.ts
import { fetchGamesWithPlaylists } from './findPublishedGames';

const __dirname = dirname(fileURLToPath(import.meta.url));

const scope: string[] = ["https://www.googleapis.com/auth/youtube.readonly"];

// Configuration de l'année pour les filtres et les requêtes
const YEAR = "2026";
const START_DATE = `${YEAR}-01-01`;
const END_DATE = `${YEAR}-12-31`;
const MAX_RESULTS = 500;

// Set to false to see progress for all playlists, even those not matching the year filter. 
// Set to true to only see playlists matching the year filter. 
const ONLY_NEW_PLAYLISTS = true;

// See "Statistics for a specific playlist"
// https://developers.google.com/youtube/analytics/sample-requests
const generateFilters = (playListIds: string[]): string => `playlist==${playListIds.join(",")}`;

// Récupération dynamique des playlists depuis la base de données SQLite
const dbPath = resolve(__dirname, '..', 'GamesPassionFR.db');
const db = new Database(dbPath, { readonly: true });

const yearsSet: Set<string> = new Set([YEAR]);
const gamesWithPlaylists = fetchGamesWithPlaylists(db, yearsSet);
db.close();

// Création d'une Map pour associer rapidement l'ID de la playlist à son titre
const playlistTitlesMap = new Map<string, string>(
  gamesWithPlaylists.map(game => [game.identifier, game.title])
);

// Extraction des identifiants (playlistId) pour le filtrage
const FILTERS: string[] = gamesWithPlaylists.map(game => game.identifier);

// Load client secrets from a local file.
// https://stackoverflow.com/a/52222827/6149867
const content = await readFile(resolve(__dirname, '..', 'YOUR_CLIENT_SECRET_FILE.json'), 'utf-8');

// Authorize a client with credentials, then make API call.
interface YouTubeCredentials {
  installed: {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
  };
}

const credentials = JSON.parse(content) as YouTubeCredentials;
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
  if (err) {
    console.error("Error retrieving access token", err);
    return;
  }
  if (token) {
    oAuth2Client.setCredentials(token);
    callApi(oAuth2Client);
  }
});

// What to do with result


/**
 * Define and execute the API request.
 * @param {any} auth An authorized OAuth2 client.
 */
const callApi = async (auth: any): Promise<void> => {
  const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

  try {
    // Définition des paramètres de base de la requête
    const queryOptions: any = {
      dimensions: "playlist",
      ids: "channel==MINE",
      maxResults: MAX_RESULTS,
      metrics: "views,estimatedMinutesWatched",
      sort: "-estimatedMinutesWatched",
      startDate: START_DATE,
      endDate: END_DATE
    };

    // On n'ajoute le filtre que si le tableau contient au moins un élément
    if (ONLY_NEW_PLAYLISTS &&FILTERS.length > 0) {
      queryOptions.filters = generateFilters(FILTERS);
    } else {
      console.log(`ℹ️ Aucune playlist trouvée pour l'année ${YEAR}. La requête s'exécutera sans filtre global.`);
    }

    const response = await youtubeAnalytics.reports.query(queryOptions);
    const rows = response.data.rows || [];

    if (rows.length > 0) {
      const filePath = resolve(__dirname, '..', 'playlists_stats.csv');
      const stream = createWriteStream(filePath);

      // Write headers to the stream
      stream.write("Playlist,Title,Views,WatchTime (minutes)\n");

      for (const row of rows) {
        const [playListId, views, watchTime] = row as [string, number, number];
        
        // Récupération du titre de la playlist depuis la Map (ou l'ID si introuvable)
        const playlistTitle = playlistTitlesMap.get(playListId) || playListId;
        
        // Write each row to the stream
        stream.write(`${playListId},"${playlistTitle.replace(/"/g, '""')}",${views},${watchTime}\n`);
      }

      // Close the stream and indicate completion
      stream.end(() => {
        console.log("Data written to playlists_stats.csv successfully.");
      });

    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.log("The API returned an error ");
    console.error(error);
  }
};