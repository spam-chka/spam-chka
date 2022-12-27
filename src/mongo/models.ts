import mongoose from "mongoose";
import {configSchema, eventSchema} from "./schemas";

export const Event = mongoose.model("Event", eventSchema);
export const Config = mongoose.model("Config", configSchema);
