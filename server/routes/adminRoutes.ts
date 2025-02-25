import express from "express";
import {
  getAllUsers,
  getAllMatches,
  deleteMatch,
  deleteMatches,
  deleteAllMatches,
  deleteUser,
} from "../controllers/adminController";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/matches", getAllMatches);
router.delete("/match/:matchId", deleteMatch);
router.delete("/matches/bulk", deleteMatches);
router.delete("/matches/all", deleteAllMatches);
router.delete("/user/:userId", deleteUser);

export default router; 