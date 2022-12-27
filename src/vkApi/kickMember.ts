import {MessagesRemoveChatUserParams, MessagesRemoveChatUserResponse} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";
import {Join, updateJoin} from "../db";
import deleteMessage from "./deleteMessage";
import {Event} from "../mongo";
import {getTimestamp} from "../timestamps";

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

export function kickMemberAndDeleteMessage(event: Event, conversation_message_id: number): void {
    // kick user
    kickMember(event).then(async () => {
        await Event.create({
            peer_id: event.peer_id,
            member_id: event.member_id,
            type: Event.EVENT_KICK,
            ts: getTimestamp()
        });
    }).catch(err => {
        console.error("kickError", event.peer_id, event.member_id, err?.error_code);
    });
    // remove his message and probably confirmation message
    const messagesToDelete = [conversation_message_id];
    if (event.type === "await_confirm" && event.meta.confirm_id !== conversation_message_id) {
        messagesToDelete.push(event.meta.confirm_id);
    }
    messagesToDelete.forEach(c_m_id =>
        deleteMessage({conversation_message_id: c_m_id, peer_id: event.peer_id})
            .catch(err => {
                console.error("deleteError", event.peer_id, event.member_id, err?.error_code);
            })
    );
}
