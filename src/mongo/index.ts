import mongoose from "mongoose";

export * from "./models";

mongoose.connect('mongodb://127.0.0.1:27017/events');

