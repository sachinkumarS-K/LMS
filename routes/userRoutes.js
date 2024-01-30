import { Router } from "express";
import {
  forgetPassword,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  updateUser,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../validator/authValidator.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.single("avatar"),
  validate(registerSchema),
  register
);
router.post("/login", validate(loginSchema), login);
router.get("/logout", logout);
router.get("/me", isLoggedIn, getProfile);

router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.put("/update", isLoggedIn, upload.single("avatar"), updateUser);

export default router;
