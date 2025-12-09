
// It acts as a bridge between Electron (backend) and your React UI (frontend). You can skip it if you don’t need backend-to-frontend communication.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  message: () => console.log('Hello from Electron preload!'),
});
