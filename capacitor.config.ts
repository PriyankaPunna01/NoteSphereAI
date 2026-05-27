import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notesphere.app',
  appName: 'NoteSphere',
  webDir: 'dist',

  server: {
    url: 'https://notesphereai-app.vercel.app',
    cleartext: true
  }
};

export default config;