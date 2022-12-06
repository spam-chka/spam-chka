import {MessagesKeyboard, MessagesSendParams} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";
import __ from "../l18n";

export type SendMessageParams = {
    peer_id: number,
    text?: string,
    keyboard?: MessagesKeyboard
}

export default function sendMessage(params: SendMessageParams) {
    return callVKAPI<MessagesSendParams, MessagesSendParams>("messages.send", {
        message: params.text,
        keyboard: JSON.stringify(params.keyboard),
        peer_id: params.peer_id
    });
}

export type SendConfirmationMessageParams = {
    peer_id,
    member_id,
}

export function sendConfirmationMessage({peer_id, member_id}: SendConfirmationMessageParams) {
    return sendMessage({
        peer_id, text: __("confirmMessage", peer_id, {memberId: member_id, kick_delay: "5 minutes"}), keyboard: {
            buttons: [
                [
                    {
                        action: {
                            type: "callback",
                            label: __("confirmButton", peer_id, {}),
                            payload: JSON.stringify({"confirm_peer_id": peer_id}),
                        }, color: "primary",
                    }
                ]
            ],
            inline: true,
            one_time: true
        }
    })
}
