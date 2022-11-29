import axios from "axios";
import {MessagesSendParams, MessagesSendResponse} from "@vkontakte/api-schema-typescript";


const url = `https://api.vk.com/method/messages.send`;
const params: MessagesSendParams = {
    peer_id: 2000000001,
    random_id: Math.round(Math.random() * 10005000),
    message: "spam"
};
axios.get(url, {
    params: {
        ...params,
        access_token: process.env.SPAMMER_TOKEN || "",
        v: "5.131"
    },
}).then(response => response.data).then(data => {
    console.log(data);
}).catch(err => {
    console.warn(err);
});
