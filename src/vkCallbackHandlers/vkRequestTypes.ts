import {Request, Response} from "express";

export type Handler = (req: Request, res: Response) => Response;

export type VKRequestType = "confirmation" | "message_new" | "message_event";

export type VKRequestBody = {
    type: VKRequestType,
    secret: string
}
