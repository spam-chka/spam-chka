import {Request, Response} from "express";

import confirmation from "./confirmation";
import messageNew from "./messageNew";
import {Handler, VKRequestBody, VKRequestType} from "./vkRequestTypes";
import messageEvent from "./messageEvent";
import {VK_SECRET} from "../config";

const handlers: {
    [key in VKRequestType]: Handler
} = {
    confirmation,
    message_new: messageNew,
    message_event: messageEvent
};

export default function vkCallbackHandler(request: Request, response: Response) {
    const {type, secret}: VKRequestBody = request.body;
    if (secret === VK_SECRET && type in handlers) {
        return handlers[type](request, response);
    }
    return response.status(404).send();
}
