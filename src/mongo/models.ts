import mongoose from "mongoose";
import {configSchema, eventSchema, TEvent, TConfig} from "./schemas";

export type Event = TEvent;
export type Config = TConfig;
export const Event = mongoose.model("Event", eventSchema);
export const Config = mongoose.model("Config", configSchema);
