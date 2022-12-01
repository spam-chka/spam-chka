import {Request, Response} from "express";
import {MessagesMessage} from "@vkontakte/api-schema-typescript";
import {VKRequestBody} from "./vkRequestTypes";
import kickMember from "../vkApi/kickMember";
import deleteMessage from "../vkApi/deleteMessage";
import {KICK_THRESHOLD_SECONDS, VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK} from "../config";
import {insertJoin, JoinId, selectJoin} from "../db";

type MessageNewBody = VKRequestBody & {
    object: {
        message: MessagesMessage
    }
}

export default function messageNew(req: Request, res: Response) {
    const {
        object: {
            message: {
                action, peer_id, date, from_id, conversation_message_id
            }
        }
    }: MessageNewBody = req.body;

    const joinId: JoinId = {
        peer_id,
        member_id: from_id
    };

    if (action && action.type && [VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK].includes(action?.type)) {
        if (action.type === VK_JOIN_ACTION_INVITE) {
            joinId.member_id = action.member_id;
        } else {
            joinId.member_id = from_id;
        }
        console.log("join", joinId.peer_id, joinId.member_id, date);
        insertJoin({...joinId, ts: date});
    } else {
        if (date - selectJoin(joinId) < KICK_THRESHOLD_SECONDS) {
            // kick user
            kickMember(joinId).catch(err => {
                console.error("kick", joinId.peer_id, joinId.member_id, date, err?.error_code);
            });
            // remove his message
            deleteMessage({conversation_message_id, peer_id}).catch(err => {
                console.error("delmsg", joinId.peer_id, joinId.member_id, date, err?.error_code);
            });
        }
    }
    return res.send("ok");
}
