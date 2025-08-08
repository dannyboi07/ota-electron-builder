const { exec, spawnSync } = require("child_process");
const path = require("path");

function chDirToRootOfRepoAndThenSomeMore(...pathFromRoot) {
    process.chdir(
        path.join(__dirname, "../", "../", "../", ...(pathFromRoot || [])),
    );
}

function chDirToBackend() {
    // process.chdir(path.join(__dirname, "../", "../", "../", "backend"));
    chDirToRootOfRepoAndThenSomeMore("backend");
}

function buildBackend() {
    let wasSuccessful = false;
    chDirToBackend();
    console.log("buildBackend(): PWD", process.cwd());

    const result = spawnSync("cargo", ["build", "--release"], {
        stdio: "inherit",
    });
    if (result.error || result.stderr) {
        console.error(
            "Error running 'cargo build --release': ",
            result.error || result.stderr,
        );
    } else wasSuccessful = true;

    return wasSuccessful;
}

function copyBackend() {
    let wasSuccessful = false;
    chDirToRootOfRepoAndThenSomeMore();
    console.log("copyBackend(): PWD", process.cwd());

    // exec("rm -rf ./frontend/public/backend", (err, stdout, stderr) => {
    //     if (err || stderr) {
    //         console.error(
    //             "Error removing the backend build files, CAN'T STOP WON'T STOP: ",
    //             err || stderr,
    //         );
    //     }

    //   });

    exec(
        "cp ./backend/target/release/backend ./frontend/public",
        (err, stdout, stderr) => {
            if (err || stderr) {
                console.error(
                    "Error copying the backend binary to the /frontend/public directory: ",
                    err || stderr,
                );
                return;
            }

            wasSuccessful = true;
        },
    );

    return wasSuccessful;
}

function cleanupTargetDir() {
    let wasSuccessful = false;
    chDirToBackend();
    console.log("cleanupTargetDir(): PWD", process.cwd());

    exec("rm -rf target", (err, stdout, stderr) => {
        if (err || stderr) {
            console.error(
                "Error removing the backend build files: ",
                err || stderr,
            );
            return;
        }

        wasSuccessful = true;
    });

    chDirToRootOfRepoAndThenSomeMore("frontend");
    return wasSuccessful;
}

function buildAndCopyBackend() {
    if (buildBackend()) {
        copyBackend();
        cleanupTargetDir();
    }
}

module.exports = buildAndCopyBackend;
