import {Request, Response} from "express";

import confirmation from "./confirmation";
import messageNew from "./messageNew";
import {VKRequestHandler, VKRequestBody, VKRequestType} from "./types";
import messageEvent from "./messageEvent";
import {VK_SECRET} from "../config";
import log from "../log";
import {getTimestamp} from "../timestamps";

const handlers: {
    [key in VKRequestType]: VKRequestHandler
} = {
    confirmation,
    message_new: messageNew,
    message_event: messageEvent
};

function getHandler(request: Request): VKRequestHandler | null {
    const {type, secret}: VKRequestBody = request.body;
    if (secret === VK_SECRET && type in handlers) {
        return handlers[type];
    }
    return null;
}

export default function vkCallbackHandler(request: Request, response: Response) {
    try {
        const handler = getHandler(request);
        if (handler) {
            return handler(request, response);
        }
    } catch (err) {
        log({ts: getTimestamp(), level: "error", payload: err, tag: "vk.callback"}).then(() => {
            response.status(400).send();
        });
        return;
    }
    return response.status(404).send();
}
