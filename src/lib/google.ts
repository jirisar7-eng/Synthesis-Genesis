import { google } from 'googleapis';
import { SynthesisStats } from './firebase';

/**
 * Google Sheets Service for Synthesis Genesis (#008-SYN)
 */

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Environment variables for Service Account
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

/**
 * Initializes the Google Sheets API client.
 * This should be called in a server-side context (Server Action or API Route).
 */
async function getSheetsClient() {
  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google Service Account credentials are missing.');
  }

  const auth = new google.auth.JWT(
    CLIENT_EMAIL,
    undefined,
    PRIVATE_KEY,
    SCOPES
  );

  return google.sheets({ version: 'v4', auth });
}

export interface SheetRowData {
  timestamp: string;
  taskId: string;
  description: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  deploymentUrl: string;
}

/**
 * Appends a new row of stats to the Google Sheet.
 */
export async function syncStatsToSheets(data: SheetRowData) {
  try {
    const sheets = await getSheetsClient();
    
    const values = [
      [
        data.timestamp,
        data.taskId,
        data.description,
        `${data.tokensInput} / ${data.tokensOutput}`,
        data.costUsd.toFixed(6),
        data.deploymentUrl || 'N/A'
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log(`[GOOGLE] Stats synced to Sheets. Updated range: ${response.data.updates?.updatedRange}`);
    return response.data;
  } catch (error: any) {
    console.error('[GOOGLE] Failed to sync to Sheets:', error.message);
    throw error;
  }
}

/**
 * Aggregates total costs from a list of SynthesisStats.
 */
export function calculateTotalProjectCost(stats: SynthesisStats[]) {
  return stats.reduce((acc, curr) => acc + (curr.token_metrics?.estimated_cost_usd || 0), 0);
}

/**
 * Example of how to format data from Firebase for Sheets
 */
export function formatStatsForSheets(stats: SynthesisStats, description: string, deploymentUrl: string): SheetRowData {
  return {
    timestamp: new Date().toLocaleString('cs-CZ'),
    taskId: stats.task_id,
    description: description,
    tokensInput: stats.token_metrics.input,
    tokensOutput: stats.token_metrics.output,
    costUsd: stats.token_metrics.estimated_cost_usd,
    deploymentUrl: deploymentUrl
  };
}
