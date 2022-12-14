import {Request, Response} from "express";
import {MessagesMessage} from "@vkontakte/api-schema-typescript";
import {VKRequestBody} from "./vkRequestTypes";
import kickMember from "../vkApi/kickMember";
import deleteMessage from "../vkApi/deleteMessage";
import {KICK_THRESHOLD_SECONDS, VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK} from "../config";
import {insertJoin, JoinId, selectJoin} from "../db";
import {sendConfirmationMessage} from "../vkApi/sendMessage";
import getUser from "../vkApi/getUser";

type MessageNewBody = VKRequestBody & {
    object: {
        message: MessagesMessage
    }
}

function isSpamMessage(text: string): boolean {
    try {
        const url = new URL(text);
    } catch (e) {
        return false;
    }
    return true;
}

function isSpamMember(user_id: number): boolean {
    if (user_id > 0) {
        // TODO: use in check: getUser({user_id}).then(console.log);
    }
    return true;
}

export default function messageNew(req: Request, res: Response) {
    const {
        object: {
            message: {
                action, peer_id, date, from_id, conversation_message_id, text
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
        if (isSpamMember(joinId.member_id)) {
            sendConfirmationMessage(joinId).then(() => {
                console.log("sendConfirm", joinId.peer_id, joinId.member_id, date);
            }).catch(console.error);
        } else {
            if (date - selectJoin(joinId) < KICK_THRESHOLD_SECONDS && isSpamMessage(text)) {
                console.log("kickStart", joinId.peer_id, joinId.member_id, date);
                // kick user
                kickMember(joinId).then(() => {
                    console.log("kickFinish", joinId.peer_id, joinId.member_id, date);
                }).catch(err => {
                    console.error("kickError", joinId.peer_id, joinId.member_id, date, err?.error_code);
                });
                console.log("deleteStart", joinId.peer_id, joinId.member_id, date);
                // remove his message
                deleteMessage({conversation_message_id, peer_id}).then(() => {
                    console.log("deleteFinish", joinId.peer_id, joinId.member_id, date);
                }).catch(err => {
                    console.error("deleteError", joinId.peer_id, joinId.member_id, date, err?.error_code);
                });
            }
        }
        return res.send("ok");
    }

}
