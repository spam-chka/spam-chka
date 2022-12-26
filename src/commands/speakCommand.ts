import {registerCommand} from "./registry";
import sendMessage from "../vkApi/sendMessage";
import {isLocale} from "../l18n";
import {setLocale} from "../db";

registerCommand({
    command: "speak",
    checker(_) {
        return Promise.resolve();
    },
    executor(commandContext) {
        const {args, peer_id} = commandContext;
        if (isLocale(args[0])) {
            setLocale({peer_id, locale: args[0]});
            return sendMessage({peer_id, text: '✅'});
        }
        return sendMessage({peer_id, text: '❌'});
    }
});
