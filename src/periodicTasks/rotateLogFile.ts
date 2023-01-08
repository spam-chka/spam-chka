import {lockLogAndDo} from "../log";
import * as fs from "fs/promises";
import * as path from "path";
import {KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

export default async function rotateLogFile() {
    const now = new Date(), today = new Date();
    today.setHours(0, 0, 0, 0);
    if (now.getTime() - today.getTime() < KICK_UNCONFIRMED_THRESHOLD_SECONDS * 1000) {
        return lockLogAndDo(async ({logDir, logFile}) => {
            const yesterday = new Date((new Date()).getTime() - 24 * 3600 * 1000);
            const yesterdayDate = yesterday.toJSON().split("T")[0];
            await fs.copyFile(logFile, path.join(logDir, `${yesterdayDate}.log`));
            await fs.truncate(logFile, 0);
        });
    }
}
