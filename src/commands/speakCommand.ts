import {registerCommand} from "./registry";
import sendMessage from "../vkApi/sendMessage";
import __, {isLocale} from "../l18n";
import {Config} from "../db";

registerCommand({
    command: "speak",
    checker(context) {
        return new Promise((res, rej) => {
            Config.findOne({peer_id: context.peer_id, name: "admin"}).then(config => {
                if (config && config.value.includes(context.from_id)) {
                    res();
                } else {
                    rej();
                }
            });
        });
    },
    async executor(commandContext) {
        const {args: [locale], peer_id} = commandContext;
        if (isLocale(locale)) {
            return Config.findOneAndUpdate({
                peer_id,
                name: "locale"
            }, {value: locale}, {upsert: true}).then(async () => {
                return sendMessage({peer_id, text: await __("setLocaleSuccess", peer_id)});
            }).catch(async () => {
                return sendMessage({peer_id, text: await __("setLocaleError", peer_id)});
            });
        }
        return sendMessage({peer_id, text: await __("unsupportedLocale", peer_id, {locale})});
    }
});
