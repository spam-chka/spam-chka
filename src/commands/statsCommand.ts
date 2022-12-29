import {registerCommand} from "./registry";
import sendMessage from "../vkApi/sendMessage";
import __ from "../l18n";
import {Event, Config} from "../db";
import {DEFAULT_LOCALE, DEV_CHATS} from "../config";
import {getTimestamp} from "../timestamps";

registerCommand({
    command: "stats",
    checker(_) {
        return Promise.resolve();
    },
    async executor(commandContext) {
        const {peer_id} = commandContext;
        const {value: locale} = await Config.findOne({peer_id, name: "locale"}) || {value: DEFAULT_LOCALE};
        const kicksAggregation = await Event.aggregate([
            {
                $match: {
                    type: Event.EVENT_KICK,
                    peer_id: {
                        $nin: DEV_CHATS
                    }
                }
            },
            {
                $group: {
                    _id: "$peer_id",
                    kicks: {
                        $count: {},
                    },
                },
            },
            {
                $facet: {
                    kicks_all: [
                        {
                            $group: {
                                _id: null,
                                kicks_per_chat: {
                                    $push: "$$CURRENT",
                                },
                            },
                        },
                        {
                            $set: {
                                value: {
                                    $reduce: {
                                        input: "$kicks_per_chat",
                                        initialValue: 0,
                                        in: {$add: ["$$value", "$$this.kicks"]},
                                    },
                                },
                            },
                        },
                    ],
                    kicks_chat: [
                        {
                            $match: {
                                _id: peer_id,
                            },
                        },
                        {
                            $set: {
                                value: {
                                    $getField: "kicks",
                                },
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    kicks_all: {
                        $arrayElemAt: ["$kicks_all.value", 0],
                    },
                    kicks_chat: {
                        $arrayElemAt: ["$kicks_chat.value", 0],
                    },
                },
            },
        ]);
        const {kicks_chat, kicks_all} = kicksAggregation.length === 1 ? kicksAggregation[0] : {
            kicks_chat: 0,
            kicks_all: 0
        };
        const chatsAggregation = await Event.aggregate([
            {
                $match: {
                    peer_id: {
                        $nin: DEV_CHATS
                    }
                }
            },
            {
                $group: {
                    _id: "$peer_id",
                    start_ts: {
                        $min: "$ts",
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    chats: {
                        $count: {},
                    },
                    start_ts: {
                        $min: "$start_ts",
                    },
                },
            },
        ]);
        const {start_ts, chats} = chatsAggregation.length === 1 ? chatsAggregation[0] : {
            start_ts: getTimestamp(),
            chats: 0
        };
        const start_date = new Date(start_ts * 1000);
        return sendMessage({
            peer_id, text: await __("stats", peer_id, {
                start_ts: `${start_date.toLocaleDateString(locale)}, ${start_date.toLocaleTimeString(locale)} UTC`,
                kicks_all: kicks_all || 0,
                kicks_chat: kicks_chat || 0,
                chats
            })
        });
    }
});
