import {FriendsGetParams, FriendsGetResponse, UsersGetParams, UsersGetResponse} from "@vkontakte/api-schema-typescript";
import callVKAPI from "./vkApi";

export type GetUserParams = {
    user_id: number
}

export type User = {
    id: number,
    first_name: string,
    last_name: string,
    deactivated: boolean,
    has_photo: boolean,
    friends_count: number
}

export default async function getUser({user_id}: GetUserParams): Promise<User> {
    const apiResponse: UsersGetResponse = await callVKAPI<UsersGetParams, UsersGetResponse>("users.get", {
        user_ids: `${user_id}`,
        fields: "has_photo,followers_count"
    });
    const [user] = apiResponse;
    let friendsResponse: FriendsGetResponse;
    try {
        friendsResponse = await callVKAPI<FriendsGetParams, FriendsGetResponse>("friends.get", {
            user_id: user_id,
            count: 1
        }, true);
    } catch (e) {
        // fallback
        friendsResponse = {count: 0, items: []};
    }
    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        deactivated: "deactivated" in user,
        has_photo: user.has_photo === 1,
        friends_count: friendsResponse.count
    };
}
