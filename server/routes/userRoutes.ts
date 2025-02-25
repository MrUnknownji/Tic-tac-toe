import express from "express";
import { createUser, loginUser, changeUsername } from "../controllers/userController";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);
router.patch("/change-username", changeUsername);

export default router; 