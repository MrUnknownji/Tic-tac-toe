import express from "express";
import { 
  createMatch, 
  getMatchesByUser, 
  deleteMatch, 
  deleteMatches, 
  deleteAllMatches 
} from "../controllers/matchController";

const router = express.Router();

// Use the controller for all routes
router.post("/", createMatch);
router.get("/user/:userId", getMatchesByUser);
router.delete("/bulk", deleteMatches);
router.delete("/all", deleteAllMatches);
router.delete("/:matchId", deleteMatch);

export default router; 