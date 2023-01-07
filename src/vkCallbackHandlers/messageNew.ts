import {MessagesMessage} from "@vkontakte/api-schema-typescript";
import {VKRequestBody} from "./types";
import {clearMember} from "../vkApi/kickMember";
import {KICK_THRESHOLD_SECONDS, VK_GROUP_ID, VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK} from "../config";
import {sendConfirmationMessage} from "../vkApi/sendMessage";
import {executeCommand, messageGetCommand} from "../commands";
import {Config, Event} from "../db";
import {getTimestamp} from "../timestamps";
import wrapAsHandler from "./wrapAsHandler";

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

function messageNeedsDeletion(event: Event | null, message: Pick<MessagesMessage, "date" | "text">): boolean {
    // return message.date - event.ts < KICK_THRESHOLD_SECONDS && isSpamMessage(message.text);
    return event && [Event.EVENT_AWAIT_CONFIRM, Event.EVENT_JOIN].includes(event.type);
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

async function messageNew(body) {
    const {
        object: {
            message: {
                action, peer_id, date, from_id, conversation_message_id, text
            }
        }
    }: MessageNewBody = body;

    let member_id = from_id;

    if (action && action.type && [VK_JOIN_ACTION_INVITE, VK_JOIN_ACTION_LINK].includes(action?.type)) {
        if (action.type === VK_JOIN_ACTION_INVITE) {
            member_id = action.member_id;
        }
        if (member_id === -VK_GROUP_ID) {
            await Config.create({
                peer_id,
                name: "admin",
                value: [from_id]
            });
            return;
        }
        await Event.create({
            type: Event.EVENT_JOIN,
            member_id: member_id,
            peer_id: peer_id,
            conversation_message_id,
            ts: date,
        });
        const needs_confirm = action.type === VK_JOIN_ACTION_LINK ? await memberNeedsConfirm(member_id) : false;
        if (needs_confirm) {
            const confirm_id = await sendConfirmationMessage({peer_id, member_id});
            await Event.create({
                type: Event.EVENT_AWAIT_CONFIRM,
                member_id: member_id,
                peer_id: peer_id,
                conversation_message_id: confirm_id,
                ts: getTimestamp()
            });
        } else {
            await Event.create({
                type: Event.EVENT_CONFIRM,
                member_id: member_id,
                peer_id: peer_id,
                ts: getTimestamp()
            });
        }
        return;
    }
    const event = await Event.findLatest({peer_id, member_id});
    if (messageNeedsDeletion(event, {date, text})) {
        await clearMember({
            peer_id,
            member_id,
            last_message_id: conversation_message_id,
            confirm_message_id: event?.conversation_message_id
        });
    } else {
        const {command, args} = messageGetCommand({text});
        if (command) {
            await executeCommand({command, args, peer_id, from_id, conversation_message_id});
        }
    }
}

export default wrapAsHandler(messageNew);
