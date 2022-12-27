import mongoose from "mongoose";
import cachegoose from "recachegoose";

cachegoose(mongoose, {
    engine: "redis",
    port: 6379,
    host: "localhost"
});
mongoose.connect('mongodb://127.0.0.1:27017/events');
export * from "./models";

