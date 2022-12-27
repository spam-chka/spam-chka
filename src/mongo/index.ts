import mongoose from "mongoose";

import {Config, Event} from "./models";

mongoose.connect('mongodb://127.0.0.1:27017/events');

export default {Event, Config};
