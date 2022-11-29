import express from "express";
import vkCallbackHandler from "./vkCallbackHandlers";
import {PORT} from "./config";

const app = express();
app.use(express.json());

app.post("/", vkCallbackHandler);

app.listen(PORT, () => {
    console.log(`Server is running, port = ${PORT}`);
});
