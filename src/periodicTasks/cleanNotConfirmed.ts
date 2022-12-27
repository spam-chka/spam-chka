import {kickMemberAndDeleteMessage} from "../vkApi/kickMember";
import {Event} from "../mongo";
import {getTimestamp} from "../timestamps";
import {KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

export default function cleanNotConfirmed() {
    Event.find({
        type: Event.EVENT_AWAIT_CONFIRM, ts: {
            $gte: getTimestamp() - KICK_UNCONFIRMED_THRESHOLD_SECONDS
        }
    }).then(events => {
        events.forEach(event => {
            kickMemberAndDeleteMessage(event as Event, event.meta.confirm_id);
        });
    });
}
