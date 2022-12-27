import {kickMemberAndDeleteMessage} from "../vkApi/kickMember";
import {Event} from "../db";
import {getTimestamp} from "../timestamps";
import {KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

export default function cleanNotConfirmed() {
    Event.aggregate([
        {
            $match: {
                ts: {
                    $gte: getTimestamp() - KICK_UNCONFIRMED_THRESHOLD_SECONDS
                }
            }
        },
        {
            $sort: {
                ts: 1
            }
        },
        {
            $group: {
                _id: {peer_id: "$peer_id", member_id: "$member_id"},
                last_event: {
                    $last: "$$CURRENT"
                }
            }
        }
    ])
        .then(groups => {
            groups.forEach(({last_event}) => {
                if(last_event.type === Event.EVENT_AWAIT_CONFIRM) {
                    kickMemberAndDeleteMessage(last_event, last_event.meta.confirm_id);
                }
            });
        });
}
