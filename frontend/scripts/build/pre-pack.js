const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const pathToRootOfRepo = path.join(__dirname, "../", "../", "../");

function chDirToRootOfRepoAndThenSomeMore(...pathFromRoot) {
    process.chdir(path.join(pathToRootOfRepo, ...(pathFromRoot || [])));
}

function buildBackend() {
    let wasSuccessful = false;
    chDirToRootOfRepoAndThenSomeMore("backend");
    console.log("buildBackend(): PWD", process.cwd(), pathToRootOfRepo);

    const result = spawnSync("cargo", ["build", "--release"], {
        stdio: "inherit",
    });
    if (result.error || result.stderr) {
        console.error(
            "Error running 'cargo build --release': ",
            result.error || result.stderr,
        );
    } else wasSuccessful = true;

    chDirToRootOfRepoAndThenSomeMore("frontend");
    return wasSuccessful;
}

function copyBackend() {
    let wasSuccessful = false;

    try {
        fs.copyFileSync(
            path.join(
                pathToRootOfRepo,
                "backend",
                "target",
                "release",
                process.platform === "darwin" ? "backend" : "backend.exe",
            ),
            path.join(
                pathToRootOfRepo,
                "frontend",
                "public",
                process.platform === "darwin" ? "backend" : "backend.exe",
            ),
        );
        wasSuccessful = true;
        console.log("Copied the backend!");
    } catch (error) {
        console.error(
            "Error copying the backend binary to the frontend's public directort",
            error,
        );
    }

    return wasSuccessful;
}

function cleanupTargetDir() {
    let wasSuccessful = false;

    try {
        fs.rmSync(path.join(pathToRootOfRepo, "backend", "target"), {
            recursive: true,
            force: true,
        });
        wasSuccessful = true;
        console.log("Removed the /backend/target dir!");
    } catch (error) {
        console.error("Error removing the backend build files: ", error);
    }

    return wasSuccessful;
}

function buildAndCopyBackend() {
    if (!buildBackend()) return;
    if (!copyBackend()) return;

    cleanupTargetDir();
}

module.exports = buildAndCopyBackend;
