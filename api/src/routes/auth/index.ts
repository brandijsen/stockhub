import express from "express";

import {
  loginRateLimit,
  registerRateLimit,
  resendVerificationRateLimit,
  verifyEmailRateLimit,
} from "../../middleware/rate-limit";
import { loginPost } from "./handlers/login";
import { logoutPost } from "./handlers/logout";
import { registerPost } from "./handlers/register";
import { resendVerificationPost } from "./handlers/resend-verification";
import { verifyEmailGet } from "./handlers/verify-email";

const router = express.Router();

router.post("/register", registerRateLimit, registerPost);
router.post("/login", loginRateLimit, loginPost);
router.post("/logout", logoutPost);
router.post("/resend-verification", resendVerificationRateLimit, resendVerificationPost);
router.get("/verify-email", verifyEmailRateLimit, verifyEmailGet);

export default router;
