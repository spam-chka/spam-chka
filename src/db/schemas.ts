import {Schema} from "mongoose";
import {Command} from "../commands/types";
import {SpamChkaLocale} from "../l18n";

const EVENT_JOIN = "join";
const EVENT_AWAIT_CONFIRM = "await_confirm";
const EVENT_CONFIRM = "confirm";
const EVENT_KICK = "kick";
const EVENT_COMMAND = "command";
const eventTypes = [EVENT_JOIN, EVENT_AWAIT_CONFIRM, EVENT_CONFIRM, EVENT_KICK, EVENT_COMMAND];
export type EventType = typeof eventTypes[number];

export type EventContext = {
    peer_id: number,
    member_id: number,
    ts: number,
    conversation_message_id: number | null
};

export type EventJoin = EventContext & {
    type: typeof EVENT_JOIN,
    meta: null
};

export type EventAwaitConfirm = EventContext & {
    type: typeof EVENT_AWAIT_CONFIRM,
    meta: null
};

export type EventConfirm = EventContext & {
    type: typeof EVENT_CONFIRM,
    meta: null,
};

export type EventKick = EventContext & {
    type: typeof EVENT_KICK,
    meta: null,
};

export type EventCommand = EventContext & {
    type: typeof EVENT_COMMAND,
    meta: Command
};

export type TEvent = EventJoin | EventAwaitConfirm | EventConfirm | EventKick | EventCommand;

export const eventSchema = new Schema(
    {
        type: {
            type: Schema.Types.String,
            enum: eventTypes,
            default: EVENT_JOIN,
            required: true
        },
        peer_id: {
            type: Schema.Types.Number,
            required: true
        },
        member_id: {
            type: Schema.Types.Number,
            required: true
        },
        ts: {
            type: Schema.Types.Number,
            required: true
        },
        conversation_message_id: Schema.Types.Number,
        meta: Schema.Types.Mixed,
    }, {
        statics: {
            EVENT_JOIN,
            EVENT_AWAIT_CONFIRM,
            EVENT_CONFIRM,
            EVENT_KICK,
            EVENT_COMMAND,
            async findLatest({
                                 peer_id,
                                 member_id
                             }: { peer_id: number, member_id: number }): Promise<TEvent | null> {
                // @ts-ignore
                const latest = await this.find({member_id, peer_id}).sort({created_at: -1}).limit(1).cache(1);
                if (latest) {
                    // @ts-ignore
                    return latest[0];
                }
                return null;
            }
        },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });

const CONFIG_LOCALE = "locale";
const CONFIG_ADMIN = "admin";

export type TLocaleConfig = {
    name: "locale",
    value: SpamChkaLocale
};

export type TAdminConfig = {
    name: "admin",
    value: number[]
}

export type TConfigBase = {
    peer_id: number,
    created_at: number,
    updated_at: number
}

export type TConfig = TConfigBase & (TAdminConfig | TLocaleConfig);

export const configSchema = new Schema({
    peer_id: Schema.Types.Number,
    name: {
        type: Schema.Types.String,
        enum: [CONFIG_LOCALE, CONFIG_ADMIN],
        default: CONFIG_LOCALE
    },
    value: Schema.Types.Mixed,
}, {
    statics: {
        CONFIG_LOCALE,
        CONFIG_ADMIN
    },
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});
