import {clearMember} from "../vkApi/kickMember";
import {Event} from "../db";
import {getTimestamp} from "../timestamps";
import {KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

export default function cleanNotConfirmed() {
    Event.aggregate([
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
        },
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $eq: [
                                "$last_event.type",
                                Event.EVENT_AWAIT_CONFIRM
                            ]
                        },
                        {
                            $lte: [
                                "$last_event.ts",
                                getTimestamp() - KICK_UNCONFIRMED_THRESHOLD_SECONDS
                            ]
                        }
                    ]

                }
            }
        }
    ])
        .then(groups => {
            groups.forEach(({last_event}) => {
                clearMember({
                    ...last_event,
                    last_message_id: last_event.conversation_message_id,
                    confirm_message_id: last_event.conversation_message_id
                });
            });
        });
}
