import {
    MessagesRemoveChatUserParams,
    MessagesRemoveChatUserResponse,
    MessagesMessage
} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";
import deleteMessages from "./deleteMessages";
import {Event} from "../db";
import {getTimestamp} from "../timestamps";
import getMessages from "./getMessages";

export type KickUserParams = {
    member_id: number,
    peer_id: number
}
export default function kickMember({member_id, peer_id}: KickUserParams) {
    return callVKAPI<MessagesRemoveChatUserParams, MessagesRemoveChatUserResponse>(
        "messages.removeChatUser", {
            member_id,
            chat_id: peer_id - 2000000000 // must be less or equal 100000000
        });
}

export type ClearMemberParams = {
    member_id: number,
    peer_id: number,
    last_message_id: number,
    confirm_message_id: number | null
}

export async function clearMember(
    {
        member_id,
        peer_id,
        last_message_id,
        confirm_message_id = null,
    }: ClearMemberParams
): Promise<void> {
    // kick user
    try {
        await kickMember({member_id, peer_id});
        await Event.create({
            peer_id,
            member_id,
            type: Event.EVENT_KICK,
            ts: getTimestamp()
        });
    } catch (err) {
        console.error("kickError", peer_id, member_id, err?.error_code);
    }
    const delete_conversation_message_ids = [];
    try {
        const joinEvent = await Event.findOne({peer_id, member_id, type: Event.EVENT_JOIN});
        if (joinEvent && joinEvent.conversation_message_id) {
            const start_message_id = joinEvent.conversation_message_id;
            const {items} = await getMessages(
                {peer_id, start_message_id, end_message_id: last_message_id}
            );
            items?.forEach((message: MessagesMessage) => {
                if (message.from_id === member_id || message.conversation_message_id === confirm_message_id) {
                    delete_conversation_message_ids.push(message.conversation_message_id);
                }
            });
        }
    } catch (err) {
        console.error("formMessagesList", peer_id, member_id, err?.error_code);
    }
    if (delete_conversation_message_ids.length === 0) {
        if (confirm_message_id) {
            delete_conversation_message_ids.push(confirm_message_id);
        }
        if (confirm_message_id !== last_message_id) {
            delete_conversation_message_ids.push(last_message_id);
        }
    }
    try {
        await deleteMessages({
            conversation_message_ids: delete_conversation_message_ids, peer_id
        });
    } catch (err) {
        console.error("deleteError", peer_id, member_id, JSON.stringify(err));
    }
}
