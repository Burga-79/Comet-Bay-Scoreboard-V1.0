const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

let mainWindow;
let displayWindow;

/* -------------------------------------------------------
   START SERVER USING CHILD PROCESS (WORKS 100% IN EXE)
------------------------------------------------------- */
function startServer() {
  const isDev = !app.isPackaged;

  let serverPath = isDev
    ? path.join(__dirname, "server.js")
    : path.join(process.resourcesPath, "app.asar.unpacked", "server.js");

  console.log("MAIN: Starting server from", serverPath);

  try {
    const child = spawn(process.execPath, [serverPath], {
      detached: true,
      stdio: "ignore"
    });

    child.unref();

    // Confirm server launch
    try {
      fs.writeFileSync("C:\\server-started.txt", "Server launched");
    } catch (err) {
      console.log("Could not write server-started.txt:", err);
    }

  } catch (err) {
    console.error("MAIN: FAILED to launch server:", err);
    try {
      fs.writeFileSync("C:\\server-error.txt", err.toString());
    } catch (writeErr) {
      console.log("Could not write server-error.txt:", writeErr);
    }
  }
}

/* -------------------------------------------------------
   CREATE WINDOWS
------------------------------------------------------- */
function createWindows() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  displayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "admin", "admin.html"));
  displayWindow.loadFile(path.join(__dirname, "display", "display.html"));
}

/* -------------------------------------------------------
   APP READY
------------------------------------------------------- */
app.whenReady().then(() => {
  startServer();
  createWindows();
});

/* -------------------------------------------------------
   QUIT ON CLOSE (WINDOWS)
------------------------------------------------------- */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
