const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let displayWindow;

// Prevent double-launch
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

function startServer() {
  const isDev = !app.isPackaged;

  const serverPath = isDev
    ? path.join(__dirname, "server.js")
    : path.join(process.resourcesPath, "app.asar.unpacked", "server.js");

  console.log("MAIN: isDev =", isDev);
  console.log("MAIN: serverPath =", serverPath);

  if (!fs.existsSync(serverPath)) {
    console.error("MAIN: server.js NOT FOUND at:", serverPath);
    return;
  }

  try {
    require(serverPath);
    console.log("MAIN: server.js loaded successfully");
  } catch (err) {
    console.error("MAIN: server.js failed to load:", err);
  }
}

function createWindows() {
  const isDev = !app.isPackaged;

  // ADMIN WINDOW
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "admin", "admin.html"));

  // DISPLAY WINDOW
  displayWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  displayWindow.loadFile(path.join(__dirname, "display", "display.html"));
}

app.whenReady().then(() => {
  startServer();
  createWindows();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
