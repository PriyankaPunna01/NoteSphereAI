import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notesphere.app',
  appName: 'NoteSphere',
  webDir: 'dist',

  server: {
    url: 'https://notes-sphere-ai.vercel.app',
    cleartext: true
  }
};

export default config;