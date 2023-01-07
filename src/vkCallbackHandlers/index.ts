import {Request, Response} from "express";

import confirmation from "./confirmation";
import messageNew from "./messageNew";
import {VKRequestHandler, VKRequestBody, VKRequestType} from "./types";
import messageEvent from "./messageEvent";
import {VK_SECRET} from "../config";

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
        console.error(err);
        return response.status(400).send();
    }
    return response.status(404).send();
}
