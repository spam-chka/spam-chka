import {MessagesKeyboard, MessagesSendParams} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";
import __ from "../l18n";

export type SendMessageParams = {
    peer_id: number,
    text?: string,
    keyboard?: Partial<MessagesKeyboard>
}

export default function sendMessage(params: SendMessageParams) {
    return callVKAPI<MessagesSendParams, MessagesSendParams>("messages.send", {
        message: params.text,
        keyboard: JSON.stringify(params.keyboard),
        peer_id: params.peer_id,
        random_id: Math.round(Math.random() * 1e15)
    });
}

export type SendConfirmationMessageParams = {
    peer_id,
    member_id,
}

export function sendConfirmationMessage({peer_id, member_id}: SendConfirmationMessageParams) {
    return sendMessage({
        peer_id, text: __(
            "confirmMessage",
            peer_id,
            {
                member_id: member_id > 0 ? `id${member_id}` : `club${-member_id}`,
                kick_delay: "5 minutes"
            }
        ), keyboard: {
            buttons: [
                [
                    {
                        action: {
                            type: "callback",
                            label: __("confirmButton", peer_id, {}),
                            payload: JSON.stringify({"confirm_peer_id": peer_id}),
                        },
                    }
                ]
            ],
            inline: true
        }
    });
}
