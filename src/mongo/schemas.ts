import {Schema} from "mongoose";

export const eventSchema = new Schema(
    {
        type: Schema.Types.Number,
        peer_id: Schema.Types.Number,
        member_id: Schema.Types.Number,
        meta: Schema.Types.Mixed,
    }, {
        statics: {
            EVENT_JOIN: 0,
            EVENT_AWAIT_CONFIRM: 1,
            EVENT_CONFIRM: 2,
            EVENT_KICK: 3,
            EVENT_COMMAND: 4,
            findLatest({peer_id, member_id}: { peer_id: number, member_id: number }) {
                return this.find({member_id, peer_id}).sort({created_at: -1}).limit(1);
            }
        },
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });

export const configSchema = new Schema({
    peer_id: Schema.Types.Number,
    name: Schema.Types.String,
    value: Schema.Types.Mixed,
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});
