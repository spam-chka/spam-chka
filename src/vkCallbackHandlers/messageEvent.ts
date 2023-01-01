import {Request, Response} from "express";
import {VKRequestBody} from "./types";
import deleteMessages from "../vkApi/deleteMessages";
import {Event} from "../db";
import {getTimestamp} from "../timestamps";
import wrapAsHandler from "./wrapAsHandler";

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

async function messageEvent(body) {
    const {
        object: {
            user_id: member_id, peer_id, conversation_message_id, payload
        }
    }: MessageEventBody = body;
    if (payload.type !== "confirm") {
        return;
    }
    const event = await Event.findOne({
        peer_id,
        member_id,
        type: Event.EVENT_AWAIT_CONFIRM,
        meta: {conversation_message_id}
    });
    if (!event) {
        return;
    }
    await Event.create({
        type: Event.EVENT_CONFIRM,
        member_id,
        peer_id,
        ts: getTimestamp()
    });
    await deleteMessages({conversation_message_ids: [conversation_message_id], peer_id});
}

export default wrapAsHandler(messageEvent);
