// if a user writes a message within KICK_THRESHOLD_SECONDS after joining,
// he/she will be considered a spamer
export const KICK_THRESHOLD_SECONDS = 120;

// if user does not confirm himself within KICK_UNCONFIRMED_THRESHOLD_SECONDS after joining,
// he/she will be kicked
export const KICK_UNCONFIRMED_THRESHOLD_SECONDS = 120;

// server port
export const PORT = process.env.SPAM_CHKA_PORT || 3000;
// internal server port
export const INTERNAL_PORT = process.env.SPAM_CHKA_INTERNAL_PORT || 50000;

// group id
export const VK_GROUP_ID = parseInt(process.env.SPAM_CHKA_GROUP_ID || "");

// group confirmation string
export const VK_GROUP_CONFIRMATION = process.env.SPAM_CHKA_CONFIRMATION || "";

// group token
export const VK_GROUP_TOKEN = process.env.SPAM_CHKA_TOKEN || "";
export const VK_SERVICE_TOKEN = process.env.SPAM_CHKA_SERVICE_TOKEN || "";
// VK API version
export const VK_API_VERSION = "5.131";

// join action types
export const VK_JOIN_ACTION_INVITE = "chat_invite_user";
export const VK_JOIN_ACTION_LINK = "chat_invite_user_by_link";

// secret
export const VK_SECRET = process.env.SPAM_CHKA_SECRET || "";

// l18n
export const DEFAULT_LOCALE = process.env.SPAM_CHKA_DEFAULT_LOCALE || "en";

// vk screen_name
export const VK_SCREEN_NAME = process.env.SPAM_CHKA_SCREEN_NAME || "spam_chka";

// external connections
export const MONGODB_CONN = process.env.SPAM_CHKA_MONGODB_CONN;
export const REDIS_CONN = process.env.SPAM_CHKA_REDIS_CONN;

// developers chats (for testing etc)
export const DEV_CHATS = process.env.SPAM_CHKA_DEV_CHATS.split(",").map(x => parseInt(x));

// log directory and file
export const LOG_DIRECTORY = process.env.SPAM_CHKA_LOG_DIRECTORY || "./logs";
export const LOG_FILE = "today.log";
