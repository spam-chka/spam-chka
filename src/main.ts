import express from "express";
import vkCallbackHandler from "./vkCallbackHandlers";
import {KICK_UNCONFIRMED_THRESHOLD_SECONDS, PORT} from "./config";
import cleanNotConfirmed from "./periodicTasks/cleanNotConfirmed";

const app = express();
app.use(express.json());

app.post("/", vkCallbackHandler);

app.listen(PORT, () => {
    console.log(`Server is running, port = ${PORT}`);
    setInterval(() => {
        cleanNotConfirmed();
    }, KICK_UNCONFIRMED_THRESHOLD_SECONDS * 1000);
});
