import {Request, Response} from "express";
import {VKRequestBody} from "./vkRequestTypes";
import deleteMessage from "../vkApi/deleteMessage";
import {selectJoin, updateJoin} from "../db";

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
            user_id, peer_id, conversation_message_id, payload
        }
    }: MessageEventBody = req.body;
    if (payload.type !== "confirm") {
        return res.send("ok");
    }
    const join = selectJoin({peer_id, member_id: user_id});
    if (join.needs_confirm && !join.confirmed && conversation_message_id === join.confirm_id) {
        console.log("confirmJoin", peer_id, user_id);
        updateJoin({peer_id, member_id: user_id, confirmed: true});
        deleteMessage({conversation_message_id, peer_id}).then(() => {
            res.send("ok");
        });
    } else {
        res.send("ok");
    }
}
