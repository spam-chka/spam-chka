import {registerCommand} from "./registry";
import sendMessage from "../vkApi/sendMessage";
import __, {isLocale} from "../l18n";
import {Config} from "../mongo";

registerCommand({
    command: "speak",
    checker(_) {
        return Promise.resolve();
    },
    executor(commandContext) {
        const {args: [locale], peer_id} = commandContext;
        if (isLocale(locale)) {
            return Config.findOneAndUpdate({peer_id, name: "locale"}, {value: locale}, {upsert: true}).then(() => {
                return sendMessage({peer_id, text: __("setLocaleSuccess", peer_id)});
            }).catch(() => {
                return sendMessage({peer_id, text: __("setLocaleError", peer_id)});
            });
        }
        return sendMessage({peer_id, text: __("unsupportedLocale", peer_id, {locale})});
    }
});
