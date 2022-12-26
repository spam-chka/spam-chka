import mongoose from "mongoose";

import {Event} from "./models";

mongoose.connect('mongodb://127.0.0.1:27017/events');

Event.create({type: Event.EVENT_KICK, member_id: 0});

Event.findLatest({peer_id: 20000000004, member_id: 1}).then(([event,]) => {
    console.log(event, event.type === Event.EVENT_AWAIT_CONFIRM);
});

export default {Event};
