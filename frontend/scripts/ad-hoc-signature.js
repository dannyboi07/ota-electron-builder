// scripts/ad-hoc-sign.js
const { execSync } = require("child_process");
const path = require("path");

/**
 * @typedef {import('electron-builder').AfterPackContext} AfterPackContext
 */

/**
 * Ad-hoc sign the app using `codesign -s -`
 *
 * @param {AfterPackContext} context
 */
exports.default = async function (context) {
    if (process.platform === "darwin") {
        const appPath = path.join(
            context.appOutDir,
            `${context.packager.appInfo.productFilename}.app`,
        );
        console.log("🔏 Ad-hoc signing app at:", appPath);
        execSync(`codesign --force --deep --sign - "${appPath}"`);
        console.log("✅ Ad-hoc signature applied");
    } else console.log("Non-Darwin platform, skipping ad-hoc signature")
};
