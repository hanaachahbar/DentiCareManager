const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load React frontend
  win.loadURL('http://localhost:3000');

  // Open DevTools (optional)
  win.webContents.openDevTools();

  // Handle navigation errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Failed to load:', errorDescription);
  });
}

// Start backend when Electron is ready
app.whenReady().then(() => {
  // Spawn backend process
  backendProcess = spawn('node', [path.join(__dirname, '../backend/server.js')], {
    stdio: 'inherit', // show backend logs in terminal
    shell: true
  });

  createWindow();
});

// Quit backend when Electron windows close
app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});