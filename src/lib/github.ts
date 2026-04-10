import { Octokit } from "octokit";
import { saveSynthesisMetrics, TokenMetrics } from "./firebase";

/**
 * GitHub Service for Synthesis Genesis
 */

const GITHUB_PAT = process.env.VITE_GITHUB_PAT;
const OWNER = process.env.VITE_GITHUB_REPO_OWNER;
const REPO = process.env.VITE_GITHUB_REPO_NAME;

let octokitInstance: Octokit | null = null;

function getOctokit() {
  if (!octokitInstance) {
    if (!GITHUB_PAT) {
      throw new Error("GITHUB_PAT environment variable is missing.");
    }
    octokitInstance = new Octokit({ auth: GITHUB_PAT });
  }
  return octokitInstance;
}

export interface FileChange {
  path: string;
  content: string;
}

/**
 * Pushes multiple files to the Synthesis repository and logs metrics to Firebase.
 * @param files Array of file paths and their new content.
 * @param message Commit message.
 * @param taskId Current task ID for logging.
 * @param metrics Token metrics for the task.
 */
export async function pushToSynthesisRepo(
  files: FileChange[],
  message: string,
  taskId: string,
  metrics: TokenMetrics,
  startTime: number
) {
  const octokit = getOctokit();
  const branch = "main";

  try {
    console.log(`[GITHUB] Starting push for task ${taskId}...`);

    // 1. Get current branch reference
    const { data: refData } = await octokit.rest.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    // 2. Get the tree SHA of the latest commit
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // 3. Create blobs and tree entries
    const tree = files.map(file => ({
      path: file.path,
      mode: "100644" as const,
      type: "blob" as const,
      content: file.content,
    }));

    // 4. Create a new tree
    const { data: newTreeData } = await octokit.rest.git.createTree({
      owner: OWNER,
      repo: REPO,
      base_tree: baseTreeSha,
      tree,
    });

    // 5. Create the commit
    const { data: newCommitData } = await octokit.rest.git.createCommit({
      owner: OWNER,
      repo: REPO,
      message: `${message} [${taskId}]`,
      tree: newTreeData.sha,
      parents: [latestCommitSha],
    });

    // 6. Update the reference
    await octokit.rest.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${branch}`,
      sha: newCommitData.sha,
    });

    const duration = Date.now() - startTime;
    console.log(`[GITHUB] Push successful: ${newCommitData.sha}`);

    // 7. Integrate with Firebase Metrics
    await saveSynthesisMetrics({
      task_id: taskId,
      architect_name: "Jiří Šár",
      token_metrics: metrics,
      duration_ms: duration,
      status: "COMPLETED",
    });

    return {
      status: "success",
      sha: newCommitData.sha,
      duration_ms: duration
    };

  } catch (error: any) {
    console.error("[GITHUB] Push failed:", error.message);
    
    // Log failure to Firebase
    await saveSynthesisMetrics({
      task_id: taskId,
      architect_name: "Jiří Šár",
      token_metrics: metrics,
      duration_ms: Date.now() - startTime,
      status: "FAILED",
    });

    throw error;
  }
}

/**
 * Example Usage:
 * 
 * const startTime = Date.now();
 * const files = [
 *   { path: 'src/App.tsx', content: '...' },
 *   { path: 'AGENTS.md', content: '...' }
 * ];
 * const metrics = { input: 100, output: 200, total: 300, estimated_cost_usd: 0.001 };
 * 
 * await pushToSynthesisRepo(
 *   files, 
 *   "Synthesis Update #006-SYN", 
 *   "#006-SYN", 
 *   metrics, 
 *   startTime
 * );
 */

/**
 * Generates a dynamic changelog summary for the commit description.
 */
export function generateSynthesisChangelog(taskId: string, changes: string[]) {
  const timestamp = new Date().toLocaleString();
  return `
Synthesis Update ${taskId}
Timestamp: ${timestamp}
Changes:
${changes.map(c => `- ${c}`).join("\n")}

Automated by Synthesis Genesis Autonomy Engine.
  `.trim();
}
