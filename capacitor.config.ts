import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notesphere.app',
  appName: 'NoteSphere',
  webDir: 'out',

  server: {
    url: 'https://note-sphere-app.vercel.app',
    cleartext: true
  }
};

export default config;