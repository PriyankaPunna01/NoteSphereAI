import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notesphere.app',
  appName: 'NoteSphere',
  webDir: 'out',

  server: {
    url: 'https://notes-app-ai-mu.vercel.app',
    cleartext: true,
  },
};

export default config;