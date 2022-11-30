import {MessagesRemoveChatUserParams, MessagesRemoveChatUserResponse} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";

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
