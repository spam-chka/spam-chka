import axios from "axios";
import {VK_API_VERSION, VK_GROUP_TOKEN, VK_SERVICE_TOKEN} from "../config";

export default async function callVKAPI<ParamsType, ResponseType>(method: string, params: ParamsType, useServiceToken: boolean = false): Promise<ResponseType> {
    const apiResponse = await axios.get(`https://api.vk.com/method/${method}`, {
        params: {
            ...params,
            access_token: useServiceToken ? VK_SERVICE_TOKEN : VK_GROUP_TOKEN,
            v: VK_API_VERSION
        },
    }).then(response => response.data);
    if ("response" in apiResponse) {
        return apiResponse.response;
    }
    throw apiResponse.error;
}
