// if a user writes a message within KICK_THRESHOLD_SECONDS after joining,
// he/she will be considered a spamer
export const KICK_THRESHOLD_SECONDS = 15;

// server port
export const PORT = process.env.SPAM_CHKA_PORT || 3000;

// group id
export const VK_GROUP_ID = parseInt(process.env.SPAM_CHKA_GROUP_ID || "");

// group confirmation string
export const VK_GROUP_CONFIRMATION = process.env.SPAM_CHKA_CONFIRMATION || "";

// group token
export const VK_GROUP_TOKEN = process.env.SPAM_CHKA_TOKEN || "";

// VK API version
export const VK_API_VERSION = "5.131";

// join action types
export const VK_JOIN_ACTION_TYPES = ["chat_invite_user", "chat_invite_user_by_link"];

