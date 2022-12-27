import {SpamChkaLocale} from "../l18n";
import {DEFAULT_LOCALE, KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

const db = {
    joins: {},
    locales: {},
    confirmations: {}
};

export type GetLocaleParams = {
    peer_id: number
};

export type SetLocaleParams = GetLocaleParams & {
    locale: SpamChkaLocale
}

export function setLocale({peer_id, locale}: SetLocaleParams) {
    db.locales[peer_id] = locale;
}

export function getLocale({peer_id}: GetLocaleParams): string {
    return db.locales[peer_id] || DEFAULT_LOCALE;
}
