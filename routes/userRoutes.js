import { Router } from "express";
import { getProfile, login, logout, register } from "../controllers/userController.js";
import isLoggedIn from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../validator/authValidator.js";

const router = Router()

router.post("/register",validate(registerSchema) , register);
router.post("/login" ,validate(loginSchema), login);
router.get("/logout" , logout);
router.get("/me" ,isLoggedIn ,  getProfile)

export default router;