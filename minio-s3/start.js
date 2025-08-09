const { spawnSync } = require("child_process");
const path = require("path");

function startMinio() {
    let result;
    result = spawnSync(
        path.join(
            __dirname,
            "bin",
            process.platform === "darwin" ? "minio" : "minio.exe",
        ),
        ["server", path.join(__dirname, "data")],
        {
            stdio: "inherit",
        },
    );

    if (result.error || result.stderror) {
        console.error(
            "Couldn't start the minio server: ",
            result.error || result.stderror,
        );

        process.exit(1);
    }
}

startMinio();
