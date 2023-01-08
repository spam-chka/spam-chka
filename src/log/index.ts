import {LOG_DIRECTORY, LOG_FILE} from "../config";
import * as fs from "fs/promises";
import * as path from "path";
import {clearInterval} from "timers";
import lockfile from "proper-lockfile";

export type LogEntry = {
    level: "info" | "error",
    tag: string,
    ts: number,
    payload: string | object
}

export type LockLogAndDoFunc = (arg: { logDir: string, logFile: string }) => Promise<void>;

export const logDir = path.resolve(LOG_DIRECTORY);
export const logFile = path.join(logDir, LOG_FILE);

async function doLog(entry: LogEntry) {
    return fs.open(logFile, "a").then(file => {
        file.appendFile(JSON.stringify(entry) + "\n");
        file.close();
    });
}

export async function lockLogAndDo(fn: LockLogAndDoFunc) {
    let attempts = 5;
    const interval = setInterval(async () => {
        --attempts;
        let release = null;
        let locked = true;
        try {
            release = await lockfile.lock(logFile);
        } catch (e) {
            console.error(`unable to lock log file, attempts left = ${attempts}`);
            locked = false;
        }
        if (attempts === 0 || locked) {
            clearInterval(interval);
        }
        if (release && locked) {
            try {
                await fn({logDir, logFile});
            } catch (e) {
                console.error("unable to do action on locked log file");
            }
            release();
        }
    }, 2000);
}

export default async function log(entry: LogEntry) {
    return lockLogAndDo(() => doLog(entry));
}
