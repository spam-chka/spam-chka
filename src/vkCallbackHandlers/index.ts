import {Request, Response} from "express";

import confirmation from "./confirmation";
import messageNew from "./messageNew";
import {Handler, VKRequestBody, VKRequestType} from "./vkRequestTypes";
import messageEvent from "./messageEvent";

const handlers: {
    [key in VKRequestType]: Handler
} = {
    confirmation,
    message_new: messageNew,
    message_event: messageEvent
};

export default function vkCallbackHandler(request: Request, response: Response) {
    const {type}: VKRequestBody = request.body;
    if (type in handlers) {
        return handlers[type](request, response);
    }
    return response.status(404).send();
}
