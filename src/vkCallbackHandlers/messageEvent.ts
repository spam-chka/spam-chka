import {Request, Response} from "express";
import {VKRequestBody} from "./vkRequestTypes";
import deleteMessage from "../vkApi/deleteMessage";
import {Event} from "../db";
import {getTimestamp} from "../timestamps";

type MessageEventPayload = {
    type: "confirm"
}

type MessageEventBody = VKRequestBody & {
    object: {
        user_id: number,
        peer_id: number,
        conversation_message_id: number,
        payload: MessageEventPayload
    }
}

export default function messageEvent(req: Request, res: Response) {
    const {
        object: {
            user_id: member_id, peer_id, conversation_message_id, payload
        }
    }: MessageEventBody = req.body;
    if (payload.type !== "confirm") {
        return res.send("ok");
    }
    Event.findOne({
        peer_id,
        member_id,
        type: Event.EVENT_AWAIT_CONFIRM,
        meta: {confirm_id: conversation_message_id}
    }).then(async event => {
        if (!event) {
            return Promise.reject({});
        }
        await Event.create({
            type: Event.EVENT_CONFIRM,
            member_id,
            peer_id,
            ts: getTimestamp()
        });
        deleteMessage({conversation_message_id, peer_id})
            .catch(() => {
                console.log("deleteMessage failed", conversation_message_id);
            }).finally(() => {
            res.send("ok");
        });
    }).catch(() => {
        res.send("ok");
    });
}
