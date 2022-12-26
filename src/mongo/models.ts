import mongoose from "mongoose";
import {eventSchema} from "./schemas";

export const Event = mongoose.model('Event', eventSchema);
