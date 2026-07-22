import express from "express";

import { listNotifications } from "./handlers/list";
import { markNotificationRead } from "./handlers/mark-read";
import { unreadNotificationsCount } from "./handlers/unread-count";

const router = express.Router();

router.get("/unread-count", unreadNotificationsCount);
router.get("/", listNotifications);
router.patch("/:id/read", markNotificationRead);

export default router;
