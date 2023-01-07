import callVKAPI from "./vkApi";
import {
    MessagesGetByConversationMessageIdParams,
    MessagesGetByConversationMessageIdResponse
} from "@vkontakte/api-schema-typescript";

export type GetMessagesParams = {
    peer_id: number,
    start_message_id: number,
    end_message_id: number | null
}

export default async function getMessages({peer_id, start_message_id, end_message_id = null}: GetMessagesParams) {
    if (typeof end_message_id !== "number") {
        end_message_id = start_message_id;
    }
    const messageIds = Array.from(Array(end_message_id - start_message_id + 1).keys()).map(i => start_message_id + i);
    return callVKAPI<MessagesGetByConversationMessageIdParams, MessagesGetByConversationMessageIdResponse>("messages.getByConversationMessageId", {
        peer_id, conversation_message_ids: messageIds.join(","),
    });
}
