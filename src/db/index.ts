import mongoose from "mongoose";
import cachegoose from "recachegoose";
import {createClient} from "redis";
import {MONGODB_CONN, REDIS_CONN} from "../config";
import {getTimestamp} from "../timestamps";
import log from "../log";

cachegoose(mongoose, {
    engine: "redis",
    client: createClient(REDIS_CONN)
});
mongoose.connect(MONGODB_CONN).catch(async err => {
    await log({ts: getTimestamp(), level: "error", tag: "db", payload: err});
});

export * from "./models";

