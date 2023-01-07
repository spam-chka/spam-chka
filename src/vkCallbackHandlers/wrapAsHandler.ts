import {Request, Response} from "express";

export default function wrapAsHandler(fn: ((body: object) => Promise<void>)) {
    return function handler(req: Request, res: Response): void {
        fn(req.body).then(() => {
            res.send("ok");
        }).catch((err) => {
            console.error(err);
            res.status(500).send();
        });
    }
}
