import express from "express";
import vkCallbackHandler from "./vkCallbackHandlers";
import {INTERNAL_PORT, KICK_UNCONFIRMED_THRESHOLD_SECONDS, LOG_DIRECTORY, LOG_FILE, PORT} from "./config";
import cleanNotConfirmed from "./periodicTasks/cleanNotConfirmed";
import rotateLogFile from "./periodicTasks/rotateLogFile";
import * as path from "path";
import log, {logFile} from "./log";
import {getTimestamp} from "./timestamps";

const app = express();
app.use(express.json());
app.disable("x-powered-by");

app.post("/", vkCallbackHandler);

app.listen(PORT, async () => {
    await log({level: "info", ts: getTimestamp(), payload: {port: PORT}, tag: "server"});
    cleanNotConfirmed();
    setInterval(() => {
        cleanNotConfirmed();
        rotateLogFile().catch(err => console.error("error while rotating log file", JSON.stringify(err)));
    }, KICK_UNCONFIRMED_THRESHOLD_SECONDS * 1000);
});

const internalApp = express();
internalApp.use(express.json());
internalApp.get("/logs", (req, res) => {
    res.sendFile(logFile);
});
internalApp.get("/stats", (req, res) => {
    res.send({});
});
internalApp.listen(INTERNAL_PORT, async () => {
    await log({level: "info", ts: getTimestamp(), payload: {port: INTERNAL_PORT}, tag: "internal_server"});
});
