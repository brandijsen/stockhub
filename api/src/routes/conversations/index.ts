import express from "express";

import { messageRateLimit } from "../../middleware/rate-limit";
import { createConversation } from "./handlers/create";
import { listConversations } from "./handlers/list";
import { listMessages, sendMessage } from "./handlers/messages";
import { markConversationRead, unreadCount } from "./handlers/read";

const router = express.Router();

router.get("/unread-count", unreadCount);
router.get("/", listConversations);
router.post("/", createConversation);
router.get("/:id/messages", listMessages);
router.post("/:id/messages", messageRateLimit, sendMessage);
router.post("/:id/read", markConversationRead);

export default router;
