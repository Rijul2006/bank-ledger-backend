import express from "express";
import { authRegisterController, authLoginController, authLogoutController } from "../controllers/auth.controllers.js";

const router = express.Router()

router.post("/register", authRegisterController)
router.post("/login",authLoginController)
router.post("/logout", authLogoutController)

export default router