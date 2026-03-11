const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let displayWindow;

/* -------------------------------------------------------
   START SERVER (DEV + PACKAGED)
------------------------------------------------------- */
function startServer() {
  const isDev = !app.isPackaged;

  let serverPath;

  if (isDev) {
    // Running from source
    serverPath = path.join(__dirname, "server.js");
  } else {
    // Running from installed EXE
    serverPath = path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "server.js"
    );
  }

  console.log("MAIN: isDev =", isDev);
  console.log("MAIN: serverPath =", serverPath);

  try {
    require(serverPath);
    console.log("MAIN: server.js loaded successfully");
  } catch (err) {
    console.error("MAIN: FAILED to load server.js:", err);
    try {
      fs.writeFileSync("C:\\server-error.txt", err.toString());
    } catch (writeErr) {
      console.error("MAIN: Could not write server-error.txt:", writeErr);
    }
  }
}

/* -------------------------------------------------------
   CREATE WINDOWS
------------------------------------------------------- */
function createWindows() {
  // Admin window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Display window
  displayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load admin UI
  mainWindow.loadFile(path.join(__dirname, "admin", "admin.html"));

  // Load display UI
  displayWindow.loadFile(path.join(__dirname, "display", "display.html"));
}

/* -------------------------------------------------------
   APP READY
------------------------------------------------------- */
app.whenReady().then(() => {
  startServer();
  createWindows();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    }
  });
});

/* -------------------------------------------------------
   QUIT ON CLOSE (WINDOWS)
------------------------------------------------------- */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
