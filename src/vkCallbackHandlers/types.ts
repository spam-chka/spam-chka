import {Request, Response} from "express";

export type VKRequestHandler = (req: Request, res: Response) => void;

export type VKRequestType = "confirmation" | "message_new" | "message_event";

export type VKRequestBody = {
    type: VKRequestType,
    secret: string
}
