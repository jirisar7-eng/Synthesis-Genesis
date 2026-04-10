import { updateDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

/**
 * Vercel Service for Synthesis Genesis
 */

const VERCEL_TOKEN = process.env.VITE_VERCEL_AUTH_TOKEN;
const PROJECT_ID = process.env.VITE_VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VITE_VERCEL_TEAM_ID;

const BASE_URL = "https://api.vercel.com";

async function vercelFetch(endpoint: string, options: RequestInit = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (TEAM_ID) url.searchParams.append("teamId", TEAM_ID);

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Vercel API Error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Checks the status of a specific deployment.
 */
export async function checkDeploymentStatus(deploymentId: string) {
  return vercelFetch(`/v13/deployments/${deploymentId}`);
}

/**
 * Gets the latest deployment for the project.
 */
export async function getLatestDeployment() {
  const data = await vercelFetch(`/v6/deployments?projectId=${PROJECT_ID}&limit=1`);
  return data.deployments[0];
}

/**
 * Monitors deployment until it reaches a terminal state (READY or ERROR).
 */
export async function monitorDeployment(deploymentId: string, statsDocId: string) {
  const maxAttempts = 30;
  const interval = 10000; // 10 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const deployment = await checkDeploymentStatus(deploymentId);
    const status = deployment.status;

    console.log(`[VERCEL] Deployment ${deploymentId} status: ${status}`);

    // Update Firebase with current status
    await updateDeploymentInFirebase(statsDocId, {
      id: deploymentId,
      url: deployment.url,
      status: status,
    });

    if (status === "READY") {
      return deployment;
    }

    if (status === "ERROR") {
      // Attempt to fetch build logs if failed
      let errorLogs = "Build failed. Check Vercel dashboard for details.";
      try {
        // Vercel doesn't have a direct "download logs" API for all plans, 
        // but we can store the error code or message if available.
        errorLogs = deployment.error?.message || errorLogs;
      } catch (e) {
        console.error("[VERCEL] Failed to fetch error logs");
      }

      await updateDeploymentInFirebase(statsDocId, {
        id: deploymentId,
        status: "ERROR",
        error_logs: errorLogs,
      });
      
      throw new Error(`Vercel Deployment Failed: ${errorLogs}`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Vercel Deployment Timeout");
}

/**
 * Updates deployment info in the synthesis_stats collection.
 */
async function updateDeploymentInFirebase(docId: string, deploymentData: any) {
  const path = `synthesis_stats/${docId}`;
  try {
    const docRef = doc(db, "synthesis_stats", docId);
    await updateDoc(docRef, {
      deployment: deploymentData
    });
  } catch (error) {
    console.error("[FIREBASE] Failed to update deployment info", error);
  }
}

/**
 * Logic to trigger after GitHub push.
 * It waits a few seconds for Vercel to detect the push and start a deployment.
 */
export async function triggerVercelMonitoring(statsDocId: string) {
  console.log("[VERCEL] Waiting for deployment to trigger...");
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s for Vercel hook

  const latest = await getLatestDeployment();
  if (latest) {
    console.log(`[VERCEL] Detected new deployment: ${latest.uid}`);
    return monitorDeployment(latest.uid, statsDocId);
  }
  throw new Error("No deployment detected after GitHub push.");
}
