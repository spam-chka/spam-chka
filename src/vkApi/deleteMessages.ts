import callVKAPI from "./vkApi";
import {MessagesDeleteParams, MessagesDeleteResponse} from "@vkontakte/api-schema-typescript";

export type DeleteMessageParams = {
    conversation_message_ids: number[],
    peer_id: number,
    delete_for_all?: 0 | 1
}

export default function deleteMessages({conversation_message_ids, peer_id, delete_for_all = 1}: DeleteMessageParams) {
    return callVKAPI<Pick<MessagesDeleteParams, "peer_id" | "delete_for_all"> & {
        cmids: string
    }, MessagesDeleteResponse>(
        "messages.delete",
        {
            peer_id,
            delete_for_all,
            cmids: conversation_message_ids.join(",")
        });
}
