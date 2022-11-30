const db = {
    joins: {}
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
