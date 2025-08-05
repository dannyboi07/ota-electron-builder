"use strict";

import { app, BrowserWindow, Notification } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import log from "electron-log";
import { autoUpdater } from "electron-updater";

console.log = log.log;
console.error = log.error;
console.warn = log.warn;
console.info = log.info;

autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");

    if (process.env.NODE_ENV === "development") {
        new Notification({
            title: "Checking for update...",
        }).show();
    }
});

autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info);
    new Notification({
        title: "Update Available!",
        body: "Downloading update in background...",
    }).show();
});

autoUpdater.on("update-not-available", (info) => {
    console.log("Update not available:", info);

    new Notification({
        title: "No updates unavaiable :(",
    }).show();
});

autoUpdater.on("error", (err) => {
    console.error("Error in auto-updater", err);
    new Notification({
        title: "Update Error",
        body: "Failed to check for updates",
    }).show();
});

let lastUpdateTime = 0;
let processNotif = null;
autoUpdater.on("download-progress", (progressObj) => {
    const totalMB = (progressObj.total / 1024 / 1024).toFixed(1);
    const transferredMB = (progressObj.transferred / 1024 / 1024).toFixed(1);
    const speedKB = Math.round(progressObj.bytesPerSecond / 1024);
    const percent = Math.round(progressObj.percent);

    let log_message = `📥 Download Progress: ${percent}% | `;
    log_message += `${transferredMB}MB / ${totalMB}MB | `;
    log_message += `Speed: ${speedKB} KB/s | `;
    log_message += `Bytes: ${progressObj.transferred}/${progressObj.total}`;

    if (progressObj.total < 50 * 1024 * 1024) {
        log_message += " 🔄 [DELTA UPDATE]";
    } else {
        log_message += " 📦 [FULL UPDATE]";
    }

    console.log(log_message);

    const now = Date.now();
    if (now - lastUpdateTime < 2000) return;
    lastUpdateTime = now;

    if (processNotif) {
        processNotif.close();
    }
    processNotif = new Notification({
        title: "Downloading Update...",
        body: `${percent}% • ${transferredMB}/${totalMB}MB • ${speedKB} KB/s`,
        silent: true,
        timeoutType: "never",
    });
    processNotif.show();
});

autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info);

    if (processNotif) {
        processNotif.close();
        processNotif = null;
    }

    if (Notification.isSupported()) {
        new Notification({
            title: "Update Ready",
            body: "Update will be installed when you close the app",
            silent: false,
        }).show();
    }
});

const isDevelopment = process.env.NODE_ENV !== "production";
// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
    // Use deterministic absolute paths
    const getAbsolutePath = (type, filename) => {
      if (isDevelopment) {
          // Use current working directory instead of app path
          const basePaths = {
              renderer: path.join(process.cwd(), 'src', 'renderer'),
              assets: path.join(process.cwd(), 'assets'),
          };
          return path.join(basePaths[type], filename);
      } else {
          // Production paths remain the same
          const basePaths = {
              renderer: path.join(process.resourcesPath, 'app', 'renderer'),
              assets: path.join(process.resourcesPath, 'app', 'assets'),
          };
          return path.join(basePaths[type], filename);
      }
  };

    const preloadPath = getAbsolutePath("renderer", "preload.js");
    const indexPath = getAbsolutePath("renderer", "index.html");

    // Log all paths for debugging
    console.log("=== ELECTRON PATHS DEBUG ===");
    console.log("Environment:", isDevelopment ? "development" : "production");
    console.log("app.getAppPath():", app.getAppPath());
    console.log("process.resourcesPath:", process.resourcesPath);
    console.log("__dirname:", __dirname);
    console.log("preloadPath:", preloadPath);
    console.log("indexPath:", indexPath);
    console.log("=== END DEBUG ===");

    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath, // Absolute path
            webSecurity: true,
        },
    });

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    // Load using absolute path
    window.loadFile(indexPath).catch((err) => {
        console.error("Failed to load index.html from:", indexPath, err);

        // Show error page with path information
        const errorHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Load Error</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .error { color: #d32f2f; }
                    .info { background: #f5f5f5; padding: 10px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1 class="error">Application Load Error</h1>
                <p>Could not load the main application file.</p>
                
                <div class="info">
                    <h3>Path Information:</h3>
                    <p><strong>Attempted to load:</strong> ${indexPath}</p>
                    <p><strong>App Path:</strong> ${app.getAppPath()}</p>
                    <p><strong>Resources Path:</strong> ${
                        process.resourcesPath
                    }</p>
                    <p><strong>Environment:</strong> ${
                        isDevelopment ? "Development" : "Production"
                    }</p>
                </div>
                
                <p>Please check that the renderer files are built and in the correct location.</p>
            </body>
            </html>
        `;
        window.loadURL(
            `data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`,
        );
    });

    window.on("closed", () => {
        mainWindow = null;
    });

    window.webContents.on("devtools-opened", () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow();

    setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 3000);

    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 10 * 60 * 1000);
});

app.on("before-quit", () => {
    if (processNotif) {
        processNotif.close();
    }
});
