import {selectUnconfimedJoins, updateJoin} from "../db";
import {kickMemberAndDeleteMessage} from "../vkApi/kickMember";

export default function cleanNotConfirmed() {
    const joins = selectUnconfimedJoins();
    joins.forEach((join) => {
        kickMemberAndDeleteMessage(join, join.confirm_id);
    });
}
