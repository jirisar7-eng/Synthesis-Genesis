import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_GITHUB_PAT': JSON.stringify(env.VITE_GITHUB_PAT),
      'process.env.VITE_GITHUB_REPO_OWNER': JSON.stringify(env.VITE_GITHUB_REPO_OWNER),
      'process.env.VITE_GITHUB_REPO_NAME': JSON.stringify(env.VITE_GITHUB_REPO_NAME),
      'process.env.VITE_VERCEL_AUTH_TOKEN': JSON.stringify(env.VITE_VERCEL_AUTH_TOKEN),
      'process.env.VITE_VERCEL_PROJECT_ID': JSON.stringify(env.VITE_VERCEL_PROJECT_ID),
      'process.env.VITE_VERCEL_TEAM_ID': JSON.stringify(env.VITE_VERCEL_TEAM_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
