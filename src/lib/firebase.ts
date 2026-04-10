import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Interface for Synthesis Task Metrics
 */
export interface TokenMetrics {
  input: number;
  output: number;
  total: number;
  estimated_cost_usd: number;
}

export interface SynthesisStats {
  task_id: string;
  architect_name: string;
  token_metrics: TokenMetrics;
  duration_ms: number;
  status: 'COMPLETED' | 'FAILED';
  timestamp: any; // Firestore ServerTimestamp
}

/**
 * Error Handling for Firestore Operations
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Saves Synthesis Metrics to Firestore
 * @param data Partial SynthesisStats (timestamp is added automatically)
 */
export async function saveSynthesisMetrics(data: Omit<SynthesisStats, 'timestamp'>) {
  const path = 'synthesis_stats';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      timestamp: serverTimestamp(),
    });
    console.log('Metrics saved with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
