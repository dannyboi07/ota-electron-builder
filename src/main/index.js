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
    new Notification({
        title: "Checking for update...",
    }).show();
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
        title: "Update Available!",
    }).show();
});

autoUpdater.on("error", (err) => {
    console.error("Error in auto-updater", err);

    new Notification({
        title: "Failed to check for updates",
    }).show();
});

let lastUpdateTime = 0;
let processNotif = null;
autoUpdater.on("download-progress", (progressObj) => {
    const totalMB = (progressObj.total / 1024 / 1024).toFixed(1);
    const transferredMB = (progressObj.transferred / 1024 / 1024).toFixed(1);
    const speedKB = Math.round(progressObj.bytesPerSecond / 1024);
    const percent = Math.round(progressObj.percent);

    // Enhanced log message with sizes
    let log_message = `📥 Download Progress: ${percent}% | `;
    log_message += `${transferredMB}MB / ${totalMB}MB | `;
    log_message += `Speed: ${speedKB} KB/s | `;
    log_message += `Bytes: ${progressObj.transferred}/${progressObj.total}`;

    // Add delta update indicator
    if (progressObj.total < 50 * 1024 * 1024) {
        // Less than 50MB = likely delta
        log_message += " 🔄 [DELTA UPDATE]";
    } else {
        log_message += " 📦 [FULL UPDATE]";
    }

    console.log(log_message);

    const now = Date.now();
    // Only update notification every 2 seconds
    if (now - lastUpdateTime < 2000) return;
    lastUpdateTime = now;

    if (processNotif) {
        processNotif.close();
        processNotif = new Notification({
            title: "Downloading Update...",
            body: `${percent}% • ${transferredMB}/${totalMB}MB • ${speedKB} KB/s`,
            silent: true,
            timeoutType: "never",
        });
        processNotif.show();
    }
});

autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded");

    // Show notification that update will install on quit
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
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "../renderer/preload.js"),
        },
    });

    if (isDevelopment) {
        window.webContents.openDevTools();
    }

    window.loadURL(
        formatUrl({
            pathname: path.join(__dirname, "../renderer/index.html"),
            protocol: "file",
            slashes: true,
        }),
    );

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

// quit application when all windows are closed
app.on("window-all-closed", () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow();

    autoUpdater.checkForUpdatesAndNotify();

    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 10 * 60 * 1000);
});
