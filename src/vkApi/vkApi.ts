import axios from "axios";
import {VK_API_VERSION, VK_GROUP_TOKEN} from "../config";

export default async function callVKAPI<ParamsType, ResponseType>(method: string, params: ParamsType): Promise<ResponseType> {
    return await axios.get(`https://api.vk.com/method/${method}`, {
        params: {
            ...params,
            access_token: VK_GROUP_TOKEN,
            v: VK_API_VERSION
        },
    }).then(response => response.data);
}
