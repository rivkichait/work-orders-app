process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


const mysql = require('mysql2/promise');
const { google } = require('googleapis');
const fs = require('fs');

require('dotenv').config();
// CONFIGURE THESE:
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'request_quote'
};
const SHEET_ID = process.env.SHEET_ID; // from the sheet URL
const SHEET_NAME = process.env.SHEET_NAME; // or whatever your tab is called

async function main() {
  // Authenticate with Google Sheets
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(fs.readFileSync('google-credentials.json')),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Connect to MySQL
  const connection = await mysql.createConnection(DB_CONFIG);
  const [rows] = await connection.execute('SELECT * FROM requests');
  await connection.end();

  // Prepare data for Sheets (add header row)
  const header = ['id', 'name', 'email', 'phone', 'service', 'message', 'created_at'];
  const values = [header, ...rows.map(row => header.map(h => row[h]))];

  // Write to Google Sheets
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREAD_SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values }
  });

  console.log('Sync complete!');
}

main().catch(console.error);