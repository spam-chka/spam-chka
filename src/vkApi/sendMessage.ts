import {MessagesKeyboard, MessagesSendParams} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";
import __ from "../l18n";
import {KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

export type SendMessageParams = {
    peer_id: number,
    text?: string,
    keyboard?: Partial<MessagesKeyboard>
}

export type SendMessageResponse = {
    conversation_message_id: number,
    peer_id: number,
    message_id: number
}[];

export default function sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return callVKAPI<MessagesSendParams, SendMessageResponse>("messages.send", {
        message: params.text,
        keyboard: JSON.stringify(params.keyboard),
        peer_ids: `${params.peer_id}`,
        random_id: Math.round(Math.random() * 1e15)
    });
}

export type SendConfirmationMessageParams = {
    peer_id,
    member_id,
}

export type SendConfirmationMessageResponse = number

export async function sendConfirmationMessage(
    {
        peer_id,
        member_id
    }: SendConfirmationMessageParams): Promise<SendConfirmationMessageResponse> {
    const [response]: SendMessageResponse = await sendMessage({
        peer_id, text: __(
            "confirmMessage",
            peer_id,
            {
                member_id: member_id > 0 ? `id${member_id}` : `club${-member_id}`,
                kick_delay: KICK_UNCONFIRMED_THRESHOLD_SECONDS / 60
            }
        ), keyboard: {
            buttons: [
                [
                    {
                        action: {
                            type: "callback",
                            label: __("confirmButton", peer_id, {}),
                            payload: JSON.stringify({"type": "confirm"}),
                        },
                    }
                ]
            ],
            inline: true
        }
    });
    return response.conversation_message_id;
}
