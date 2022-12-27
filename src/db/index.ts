import mongoose from "mongoose";
import cachegoose from "recachegoose";
import {createClient} from "redis";

cachegoose(mongoose, {
    engine: "redis",
    client: createClient("redis://localhost:6379")
});
mongoose.connect('mongodb://127.0.0.1:27017/events');

export * from "./models";

