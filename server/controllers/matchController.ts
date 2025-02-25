import { Request, Response } from "express";
import Match, { IMatch, MatchResult } from "../models/Match";
import User from "../models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

interface CreateMatchRequest {
  user: string;
  result: MatchResult;
}

interface DeleteMatchRequest {
  userId: string;
  password: string;
}

interface DeleteMatchesRequest {
  userId: string;
  password: string;
  ids: string[];
}

const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, result } = req.body as CreateMatchRequest;

    if (!user || !result) {
      res.status(400).json({ error: "User and results are required" });
      return;
    }

    const newMatch = new Match({ user, result });
    await newMatch.save();
    res.status(201).json(newMatch);
  } catch (error) {
    console.error("Error recording match: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMatchesByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalMatches = await Match.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalMatches / limit);
    
    // Get matches with pagination
    const matches = await Match.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Log the response for debugging
    console.log('Matches found:', matches.length);
    
    res.json({
      matches,
      currentPage: page,
      totalPages,
      totalMatches
    });
  } catch (error) {
    console.error('Error fetching user matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a single match record (for a user)
const deleteMatch = async (req: Request, res: Response): Promise<void> => {
  const { userId, password } = req.body as DeleteMatchRequest;
  const { matchId } = req.params;
  if (!userId || !password) {
    res.status(400).json({ error: "UserId and password are required" });
    return;
  }
  try {
    // Explicitly type the match result and ensure it's populated
    const match = await Match.findById(matchId).exec();
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    // Now TypeScript knows that match.user is ObjectId
    if (match.user.toString() !== userId) {
      res.status(403).json({ error: "Not authorized to delete this match" });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    await Match.findByIdAndDelete(matchId);
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete selected matches (bulk deletion)
const deleteMatches = async (req: Request, res: Response): Promise<void> => {
  const { userId, password, ids } = req.body as DeleteMatchesRequest;
  if (!userId || !password || !ids || !Array.isArray(ids)) {
    res.status(400).json({ error: "UserId, password, and array of match IDs are required" });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const result = await Match.deleteMany({ _id: { $in: ids }, user: userId });
    res.status(200).json({ 
      message: "Selected matches deleted successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete all matches for the authenticated user
const deleteAllMatches = async (req: Request, res: Response): Promise<void> => {
  const { userId, password } = req.body as DeleteMatchRequest;
  if (!userId || !password) {
    res.status(400).json({ error: "UserId and password are required" });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const result = await Match.deleteMany({ user: userId });
    res.status(200).json({ 
      message: "All matches deleted successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createMatch, getMatchesByUser, deleteMatch, deleteMatches, deleteAllMatches }; 