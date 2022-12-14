import {MessagesRemoveChatUserParams, MessagesRemoveChatUserResponse} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";
import {Join, updateJoin} from "../db";
import deleteMessage from "./deleteMessage";

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

export function kickMemberAndDeleteMessage(join: Join, conversation_message_id: number): void {
    console.log("kickStart", join.peer_id, join.member_id);
    // kick user
    kickMember(join).then(() => {
        // hack: confirm to prevent multiple kicks
        updateJoin({...join, confirmed: true});
        console.log("kickFinish", join.peer_id, join.member_id);
    }).catch(err => {
        console.error("kickError", join.peer_id, join.member_id, err?.error_code);
    });
    console.log("deleteStart", join.peer_id, join.member_id);
    // remove his message and probably confirmation message
    const messagesToDelete = [conversation_message_id];
    if (join.needs_confirm && conversation_message_id !== join.confirm_id) {
        messagesToDelete.push(join.confirm_id);
    }
    messagesToDelete.forEach(c_m_id =>
        deleteMessage({conversation_message_id: c_m_id, peer_id: join.peer_id}).then(() => {
            console.log("deleteFinish", join.peer_id, join.member_id);
        }).catch(err => {
            console.error("deleteError", join.peer_id, join.member_id, err?.error_code);
        })
    );
}
