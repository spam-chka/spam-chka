import {Request, Response} from "express";
import {VKRequestBody} from "./vkRequestTypes";
import {VK_GROUP_CONFIRMATION, VK_GROUP_ID} from "../config";

type ConfirmationBody = VKRequestBody & {
    group_id: number
};

export default function confirmation(req: Request, res: Response) {
    const confirmBody: ConfirmationBody = req.body;
    if (confirmBody.group_id === VK_GROUP_ID) {
        return res.send(VK_GROUP_CONFIRMATION);
    }
    return res.status(404).send();
};
