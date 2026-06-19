import express from "express";

import { profileImageUpload } from "../../middleware/profile-upload";
import { getProfile } from "./handlers/get";
import {
  deleteProfileImage,
  getProfileImage,
  uploadProfileImage,
} from "./handlers/image";
import { changePassword } from "./handlers/password";
import { updateProfile } from "./handlers/update";

const router = express.Router();

function handleProfileImageUpload(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  profileImageUpload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : "Invalid image upload",
      });
      return;
    }
    next();
  });
}

router.get("/image", getProfileImage);
router.post("/image", handleProfileImageUpload, uploadProfileImage);
router.delete("/image", deleteProfileImage);
router.patch("/password", changePassword);
router.get("/", getProfile);
router.patch("/", updateProfile);

export default router;
