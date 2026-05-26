import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.notesphere.app',
  appName: 'NoteSphere',

  server: {
    url: 'http://192.168.29.235:3000',
    cleartext: true,
  },
}

export default config