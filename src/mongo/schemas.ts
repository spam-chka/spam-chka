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

export interface TEvent {
    type: EventType,
    peer_id: number,
    member_id: number,
    meta: Command | null
}

export const eventSchema = new Schema(
    {
        type: {
            type: Schema.Types.String,
            enum: eventTypes,
            default: EVENT_JOIN
        },
        peer_id: Schema.Types.Number,
        member_id: Schema.Types.Number,
        meta: Schema.Types.Mixed,
    }, {
        statics: {
            EVENT_JOIN,
            EVENT_AWAIT_CONFIRM,
            EVENT_CONFIRM,
            EVENT_KICK,
            EVENT_COMMAND,
            findLatest({peer_id, member_id}: { peer_id: number, member_id: number }) {
                return this.find({member_id, peer_id}).sort({created_at: -1}).limit(1);
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

export interface TConfigBase {
    peer_id: number,
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
