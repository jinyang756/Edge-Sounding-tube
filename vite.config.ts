import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom plugin to copy manifest and icons to dist folder
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle: async () => {
      // Copy manifest.json
      if (fs.existsSync('manifest.json')) {
        fs.copyFileSync('manifest.json', 'dist/manifest.json');
        console.log('✓ manifest.json copied to dist');
      }
      // Copy icons folder if it exists
      if (fs.existsSync('icons')) {
        fs.cpSync('icons', 'dist/icons', { recursive: true });
        console.log('✓ icons folder copied to dist');
      }
    }
  };
};

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, path.resolve('.'), '');
  
  // In CI/CD (GitHub Actions), values might be in process.env, not in a .env file loaded by loadEnv
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react(), copyExtensionFiles()],
    define: {
      // Inject the API key into the build
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});