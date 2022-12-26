import {getLocale} from "./db";
import format from "./formatString";

export type SpamChkaLocale = "en" | "ru";

export type SpamChkaLocalization = {
    confirmMessage: string,
    confirmButton: string
}

export type SpamChkaLocalizations = {
    [L in SpamChkaLocale]: SpamChkaLocalization
};

const localizations: SpamChkaLocalizations = {
    en: {
        confirmMessage: "Hey, @{member_id}! Confirm you're not a bot or I'll have to kick you :(\nMinute(s) left: {kick_delay}.",
        confirmButton: "I am not a bot"
    },
    ru: {
        confirmMessage: "Добро пожаловать, @{member_id}! Подтвердите, что Вы не бот или мне придется исключить Вас :(\nОсталось минут: {kick_delay}.",
        confirmButton: "Я не бот"
    }
}

export default function __(key: keyof SpamChkaLocalization, peer_id: number, repl?: object) {
    const locale = getLocale({peer_id});
    const localization = localizations[locale];
    return format(localization[key], repl || {});
}

export function isLocale(candidate: string): candidate is SpamChkaLocale {
    return Object.keys(localizations).includes(candidate);
}
