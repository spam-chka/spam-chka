import {Request, Response} from "express";
import {MessagesMessage} from "@vkontakte/api-schema-typescript";
import {VKRequestBody} from "./vkRequestTypes";
import kickMember from "../vkApi/kickMember";
import deleteMessage from "../vkApi/deleteMessage";
import {KICK_THRESHOLD_SECONDS, VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK} from "../config";
import {insertJoin, Join, JoinId, selectJoin, updateJoin} from "../db";
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

function messageNeedsDeletion(join: Join, message: Pick<MessagesMessage, "date" | "text">): boolean {
    console.log(join);
    if (join.needs_confirm && !join.confirmed) {
        return true;
    }
    return message.date - join.ts < KICK_THRESHOLD_SECONDS && isSpamMessage(message.text);

}

async function memberNeedsConfirm(member_id: number): Promise<boolean> {
    if (member_id > 0) {
        const user = await getUser({user_id: member_id});
        if (user.friends_count === 0 || user.deactivated) {
            return true;
        }
        return !!(!user.has_photo && (user.first_name + user.last_name).toLowerCase().match(/^[a-z\-]*$/));
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
        memberNeedsConfirm(joinId.member_id).then(needs_confirm => {
            const join: Join = {
                ...joinId,
                needs_confirm: true,
                confirmed: false,
                ts: date
            };
            console.log("join", join);
            insertJoin(join);
            if (join.needs_confirm) {
                sendConfirmationMessage(joinId).then(confirm_id => {
                    console.log("sendConfirm", joinId.peer_id, joinId.member_id, date);
                    join.confirm_id = confirm_id;
                    updateJoin(join);
                }).catch(console.error);
            }
        });
    } else {
        const join = selectJoin(joinId);
        if (messageNeedsDeletion(join, {date, text})) {
            console.log("kickStart", joinId.peer_id, joinId.member_id, date);
            // kick user
            kickMember(joinId).then(() => {
                console.log("kickFinish", joinId.peer_id, joinId.member_id, date);
            }).catch(err => {
                console.error("kickError", joinId.peer_id, joinId.member_id, date, err?.error_code);
            });
            console.log("deleteStart", joinId.peer_id, joinId.member_id, date);
            // remove his message and probably confirmation message
            const messagesToDelete = [conversation_message_id];
            if (join.needs_confirm) {
                messagesToDelete.push(join.confirm_id);
            }
            messagesToDelete.forEach(c_m_id =>
                deleteMessage({conversation_message_id: c_m_id, peer_id}).then(() => {
                    console.log("deleteFinish", joinId.peer_id, joinId.member_id, date);
                }).catch(err => {
                    console.error("deleteError", joinId.peer_id, joinId.member_id, date, err?.error_code);
                })
            );
        }
    }
    return res.send("ok");
}
