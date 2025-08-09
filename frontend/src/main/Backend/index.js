import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import Logger from "electron-log";
import { access } from "fs";
import path from "path";

class Backend {
    /**
     * @type {ChildProcessWithoutNullStreams}
     */
    #process = null;
    /**
     * @type {Logger.LogFunctions}
     */
    #logger;

    /**
     * @param {Logger.LogFunctions} logger
     */
    constructor(logger) {
        this.#logger = logger;
    }

    start() {
        this.#logger.info("[Backend] Starting the backend...");
        const executableName =
            process.platform === "darwin" ? "backend" : "backend.exe";

        const executablePath = path.join(
            process.env.NODE_ENV !== "production"
                ? process.cwd()
                : process.resourcesPath,
            "public",
            executableName,
        );

        access(executablePath, (err) => {
            if (err?.code !== "ENOENT") {
                this.#process = spawn(executablePath);
                this.#setupProcess();
            }
        });
    }

    #setupProcess() {
        this.#process.on("error", (err) => {
            this.#logger.error("[Backend] Error: ", err);
        });

        this.#process.stderr.on("data", (data) => {
            this.#logger.error(
                "[Backend] STDERR Data: ",
                data?.toString
                    ? data?.toString()
                    : data || "Received nothing :(",
            );
        });

        this.#process.stdout.on("data", (data) => {
            this.#logger.log(
                "[Backend] STDOUT Data",
                data?.toString
                    ? data?.toString()
                    : data || "Received nothing :(",
            );
        });

        this.#process.stdout.on("close", (data) => {
            this.#logger.warn(
                "[Backend] STDOUT Close Data",
                data?.toString
                    ? data?.toString()
                    : data || "Received nothing :(",
            );
        });

        this.#process.stdout.on("exit", (data) => {
            this.#logger.warn(
                "[Backend] STDOUT Exit Data",
                data?.toString
                    ? data?.toStrign()
                    : data || "Received nothing :(",
            );
        });

        this.#process.on("exit", (code, signal) => {
            console.warn(
                `[Backend] Process exited, code: ${code?.toString()}, signal: ${signal}`,
            );

            this.#process = null;
        });
    }

    stop() {
        if (!this.#process) {
            console.warn("[Backend] (stop) Process isn't present!");
            return;
        }

        try {
            process.kill(this.#process.pid);
            this.#process.kill();

            console.log("[Backend] (stop) Killed the backend process!");
        } catch (error) {
            console.log(
                "[Backend] (stop) Error killing the backend process: ",
                error,
            );
        }
    }
}

export default Backend;
