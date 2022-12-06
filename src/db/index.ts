import {SpamChkaLocale} from "../l18n";
import {DEFAULT_LOCALE} from "../config";

const db = {
    joins: {},
    locales: {}
};

export type JoinId = {
    peer_id: number,
    member_id: number,
}

export type InsertJoinParams = JoinId & {
    ts: number
}

export type SelectJoinParams = JoinId;
export type DeleteJoinParams = JoinId;

export function insertJoin({peer_id, member_id, ts}: InsertJoinParams) {
    if (!db.joins[peer_id]) {
        db.joins[peer_id] = {};
    }
    db.joins[peer_id][member_id] = ts;
}

export function selectJoin({peer_id, member_id}: SelectJoinParams) {
    if (db.joins[peer_id] && db.joins[peer_id][member_id]) {
        return db.joins[peer_id][member_id];
    }
    return -1;
}

export function deleteJoin({peer_id, member_id}: DeleteJoinParams) {
    if (db.joins[peer_id] && db.joins[peer_id][member_id]) {
        delete db.joins[peer_id][member_id];
    }
}

export type GetLocaleParams = {
    peer_id: number
};

export type SetLocaleParams = GetLocaleParams & {
    locale: SpamChkaLocale
}

export function setLocale({peer_id, locale}: SetLocaleParams) {
    db.locales[peer_id] = locale;
}

export function getLocale({peer_id}: GetLocaleParams) {
    return db.locales[peer_id] || DEFAULT_LOCALE;
}
