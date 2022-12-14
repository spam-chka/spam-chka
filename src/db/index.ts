import {SpamChkaLocale} from "../l18n";
import {DEFAULT_LOCALE, KICK_UNCONFIRMED_THRESHOLD_SECONDS} from "../config";

const db = {
    joins: {},
    locales: {},
    confirmations: {}
};

export type JoinId = {
    peer_id: number,
    member_id: number,
}

export type JoinBody = {
    ts: number,
    needs_confirm: boolean,
    confirmed: boolean,
    confirm_id?: number
}

export type Join = JoinId & JoinBody;

export type InsertJoinParams = Join;
export type UpdateJoinParams = JoinId & Partial<JoinBody>;
export type SelectJoinParams = JoinId;

export function insertJoin({peer_id, member_id, ...join}: InsertJoinParams) {
    if (!db.joins[peer_id]) {
        db.joins[peer_id] = {};
    }
    db.joins[peer_id][member_id] = join;
}

export function updateJoin({peer_id, member_id, ...join}: UpdateJoinParams) {
    if (db.joins[peer_id] && db.joins[peer_id][member_id]) {
        const existingJoin = db.joins[peer_id][member_id];
        db.joins[peer_id][member_id] = {
            ...existingJoin,
            ...join
        }
    }
}

export function selectJoin({peer_id, member_id}: SelectJoinParams): Join {
    if (db.joins[peer_id] && db.joins[peer_id][member_id]) {
        return {peer_id, member_id, ...db.joins[peer_id][member_id]};
    }
    return {peer_id, member_id, ts: -1, needs_confirm: false, confirmed: false};
}

export function selectUnconfimedJoins(): Join[] {
    const joins = [];
    for (let peer_id in db.joins) {
        for (let member_id in db.joins[peer_id]) {
            const join: Join = db.joins[peer_id][member_id];
            if (!join.confirmed && join.needs_confirm &&
                (new Date()).getTime() / 1000 - join.ts > KICK_UNCONFIRMED_THRESHOLD_SECONDS
            ) {
                joins.push({
                    peer_id, member_id, ...join
                });
            }
        }
    }
    return joins;
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

export function getLocale({peer_id}: GetLocaleParams): string {
    return db.locales[peer_id] || DEFAULT_LOCALE;
}
