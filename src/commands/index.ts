import {MessagesMessage} from "@vkontakte/api-schema-typescript";
import {VK_SCREEN_NAME} from "../config";
import sendMessage from "../vkApi/sendMessage";
import {Command, CommandContext} from "./types";
import {selectCommand} from "./registry";
import * as Process from "process";

function splitToArgs(s: string): string[] {
    const parts = s.split(" ");
    if (parts.length == 0) {
        return [];
    }
    const args = [];
    let arg = "";
    for (let i = 0; i < parts.length; ++i) {
        if (parts[i].startsWith('\"')) {
            if (!parts[i].endsWith('\"')) {
                arg = parts[i].slice(1);
            } else {
                args.push(parts[i].slice(1, -1));
            }
        } else if (parts[i].endsWith('\"')) {
            arg += " " + parts[i].slice(0, -1);
            args.push(arg);
            arg = "";
        } else if (arg.length > 0) {
            arg += " " + parts[i];
        } else {
            args.push(parts[i]);
        }
    }
    return args;
}

export function messageGetCommand(message: Pick<MessagesMessage, "text">): Command {
    const {text} = message;
    const trimmedText = text.trim();
    const tag = `@${VK_SCREEN_NAME}`;
    const match = trimmedText.match(new RegExp(`\\[[a-z0-9_]+\\|${tag}\\] (.*)`, "um"));
    if (match && match[0] === trimmedText) {
        const [, command, ...args] = splitToArgs(text);
        return {command, args};
    }
    return {
        command: null,
        args: []
    }
}

export function executeCommand(commandContext: CommandContext): Promise<object> {
    const entry = selectCommand(commandContext);
    return new Promise((res, rej) => {
        if (!entry) {
            return rej({error: {error_text: "cannot execute this command."}});
        }
        const {checker, executor} = entry;
        checker(commandContext).then(() => {
            executor(commandContext).then(res).catch(rej);
        }).catch(() => {
            rej({error: {error_text: "cannot execute this command."}});
        });
    });

}


// Load our commands
import "./speakCommand";
