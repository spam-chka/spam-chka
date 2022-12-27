import {Request, Response} from "express";
import {MessagesMessage} from "@vkontakte/api-schema-typescript";
import {VKRequestBody} from "./vkRequestTypes";
import {kickMemberAndDeleteMessage} from "../vkApi/kickMember";
import {KICK_THRESHOLD_SECONDS, VK_GROUP_ID, VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK} from "../config";
import {sendConfirmationMessage} from "../vkApi/sendMessage";
import {executeCommand, messageGetCommand} from "../commands";
import {Config, Event} from "../db";
import {getTimestamp} from "../timestamps";

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

function messageNeedsDeletion(event: Event, message: Pick<MessagesMessage, "date" | "text">): boolean {
    if (event.type === Event.EVENT_AWAIT_CONFIRM) {
        return true;
    }
    return message.date - event.ts < KICK_THRESHOLD_SECONDS && isSpamMessage(message.text);

}

async function memberNeedsConfirm(member_id: number): Promise<boolean> {
    /*if (member_id > 0) {
        const user = await getUser({user_id: member_id});
        if (user.friends_count === 0 || user.deactivated) {
            return true;
        }
        return !!(!user.has_photo && true /!*(user.first_name + user.last_name).toLowerCase().match(/^[a-z\-]*$/)*!/);
    }*/
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

    let member_id = from_id;

    if (action && action.type && [VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK].includes(action?.type)) {
        if (action.type === VK_JOIN_ACTION_INVITE) {
            member_id = action.member_id;
        }
        if (member_id === -VK_GROUP_ID) {
            Config.create({
                peer_id,
                name: "admin",
                value: [from_id]
            }).catch(() => {
                console.error("create admin error, peer_id=", peer_id);
            });
        } else {
            Event.create({
                type: Event.EVENT_JOIN,
                member_id: member_id,
                peer_id: peer_id,
                ts: date
            }).then(() => {
                memberNeedsConfirm(member_id).then(async needs_confirm => {
                    if (action.type !== VK_JOIN_ACTION_LINK) {
                        needs_confirm = false;
                    }
                    if (needs_confirm) {
                        sendConfirmationMessage({peer_id, member_id}).then(async confirm_id => {
                            await Event.create({
                                type: Event.EVENT_AWAIT_CONFIRM,
                                member_id: member_id,
                                peer_id: peer_id,
                                meta: {confirm_id},
                                ts: getTimestamp()
                            });
                        }).catch(console.error);
                    } else {
                        await Event.create({
                            type: Event.EVENT_CONFIRM,
                            member_id: member_id,
                            peer_id: peer_id,
                            ts: getTimestamp()
                        })
                    }
                });
            });
        }
    } else {
        Event.findLatest({peer_id, member_id}).then(event => {
            if (event && messageNeedsDeletion(event, {date, text})) {
                kickMemberAndDeleteMessage(event, conversation_message_id);
            } else {
                const {command, args} = messageGetCommand({text});
                if (command) {
                    executeCommand({command, args, peer_id, from_id}).catch(err => {
                        console.error("executeCommand", err)
                    });
                }
            }
        });
    }
    return res.send("ok");
}
