import format from "./formatString";
import {Config} from "./db";
import {DEFAULT_LOCALE} from "./config";

export type SpamChkaLocale = "en" | "ru";

export type SpamChkaLocalization = {
    confirmMessage: string,
    confirmButton: string,
    setLocaleSuccess: string,
    setLocaleError: string,
    unsupportedLocale: string,
    stats: string,
}

export type SpamChkaLocalizations = {
    [L in SpamChkaLocale]: SpamChkaLocalization
};

const localizations: SpamChkaLocalizations = {
    en: {
        confirmMessage: "Hey, @{member_id}! Confirm you're not a bot or I'll have to kick you :(\nMinute(s) left: {kick_delay}.",
        confirmButton: "I am not a bot",
        setLocaleSuccess: "Language set successfully.",
        setLocaleError: "Error while setting language.",
        unsupportedLocale: "Language {locale} is not supported.",
        stats: `Stats (since {start_ts}): 
Chats (excluding dev ones): {chats}
Bots kicked (this chat): {kicks_chat}
Bots kicked (all the chats): {kicks_all}`
    },
    ru: {
        confirmMessage: "Добро пожаловать, @{member_id}! Подтвердите, что Вы не бот или мне придется исключить Вас :(\nОсталось минут: {kick_delay}.",
        confirmButton: "Я не бот",
        setLocaleSuccess: "Язык успешно установлен.",
        setLocaleError: "Ошибка при установке языка.",
        unsupportedLocale: "Язык {locale} не поддерживается.",
        stats: `Статистика (начиная с {start_ts}):
Чаты (кроме тестовых): {chats}
Ботов исключено (этот чат): {kicks_chat}
Ботов исключено (все чаты): {kicks_all}`
    }
}

export default async function __(key: keyof SpamChkaLocalization, peer_id: number, repl: object = {}) {
    let {value: locale} = await Config.findOne({peer_id, name: "locale"}) || {value: DEFAULT_LOCALE};
    const localization = localizations[locale];
    return format(localization[key], repl || {});
}

export function isLocale(candidate: string): candidate is SpamChkaLocale {
    return Object.keys(localizations).includes(candidate);
}
