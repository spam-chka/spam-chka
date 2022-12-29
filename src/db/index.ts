import mongoose from "mongoose";
import cachegoose from "recachegoose";
import {createClient} from "redis";
import {MONGODB_CONN, REDIS_CONN} from "../config";

cachegoose(mongoose, {
    engine: "redis",
    client: createClient(REDIS_CONN)
});
mongoose.connect(MONGODB_CONN);

export * from "./models";

