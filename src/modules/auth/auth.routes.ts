import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
const ctrl = new AuthController();

router.post("/register", ctrl.register);
router.post("/login",    ctrl.login);
router.post("/refresh",  ctrl.refresh);
router.post("/logout",   ctrl.logout);

export default router;
