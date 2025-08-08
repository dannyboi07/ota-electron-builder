const { execSync } = require("child_process");
const path = require("path");

/**
 * @typedef {import('electron-builder').AfterPackContext} AfterPackContext
 */

/**
 * Electron Builder afterSign hook to remove code signature from .app
 * (used to fix issues with Squirrel.Mac OTA updates on unsigned builds)
 *
 * @param {AfterPackContext} context - The context object provided by electron-builder
 */
exports.default = async function (context) {
    if (process.platform === "darwin") {
        const appPath = path.join(
            context.appOutDir,
            `${context.packager.appInfo.productFilename}.app`,
        );
        console.log("🔧 Removing code signature from:", appPath);
        execSync(`codesign --remove-signature "${appPath}"`);
        console.log("✅ Signature removed");
    } else console.log("Non-Darwin platform, skipping removal of signature")
};
