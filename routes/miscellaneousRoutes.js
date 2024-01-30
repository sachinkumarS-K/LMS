import { Router } from "express";
import { contactUs } from "../controllers/miscellaneousController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/contact").post(isLoggedIn, contactUs);

export default router;
