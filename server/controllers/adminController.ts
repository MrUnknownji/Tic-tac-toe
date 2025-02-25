import { Request, Response } from "express";
import User from "../models/User";
import Match from "../models/Match";
import bcrypt from "bcrypt";

interface AdminCredentials {
  adminUsername: string;
  adminPassword: string;
}

interface DeleteMatchesRequest extends AdminCredentials {
  ids: string[];
}

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Get users with pagination
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit);
    
    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalMatches = await Match.countDocuments();
    const totalPages = Math.ceil(totalMatches / limit);
    
    // Get matches with pagination and populate user info
    const matches = await Match.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username');
    
    // Format the response to include username
    const formattedMatches = matches.map(match => ({
      _id: match._id,
      user: match.user._id,
      username: (match.user as any).username,
      result: match.result,
      createdAt: match.createdAt
    }));
    
    res.json({
      matches: formattedMatches,
      currentPage: page,
      totalPages,
      totalMatches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a single match record (admin)
const deleteMatch = async (req: Request, res: Response): Promise<void> => {
  const { adminUsername, adminPassword } = req.body as AdminCredentials;
  const { matchId } = req.params;
  if (!adminUsername || !adminPassword) {
    res.status(400).json({ error: "Admin credentials required" });
    return;
  }
  try {
    const adminUser = await User.findOne({ username: adminUsername });
    if (!adminUser || !adminUser.isAdmin) {
      res.status(403).json({ error: "Not an admin user" });
      return;
    }
    const passwordMatch = await bcrypt.compare(adminPassword, adminUser.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    await Match.findByIdAndDelete(matchId);
    res.status(200).json({ message: "Match deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete selected matches (admin bulk deletion)
const deleteMatches = async (req: Request, res: Response): Promise<void> => {
  const { adminUsername, adminPassword, ids } = req.body as DeleteMatchesRequest;
  if (!adminUsername || !adminPassword || !ids || !Array.isArray(ids)) {
    res.status(400).json({ error: "Admin credentials and array of match IDs are required" });
    return;
  }
  try {
    const adminUser = await User.findOne({ username: adminUsername });
    if (!adminUser || !adminUser.isAdmin) {
      res.status(403).json({ error: "Not an admin user" });
      return;
    }
    const passwordMatch = await bcrypt.compare(adminPassword, adminUser.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    const result = await Match.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ 
      message: "Selected matches deleted successfully by admin", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete all matches (admin)
const deleteAllMatches = async (req: Request, res: Response): Promise<void> => {
  const { adminUsername, adminPassword } = req.body as AdminCredentials;
  if (!adminUsername || !adminPassword) {
    res.status(400).json({ error: "Admin credentials are required" });
    return;
  }
  try {
    const adminUser = await User.findOne({ username: adminUsername });
    if (!adminUser || !adminUser.isAdmin) {
      res.status(403).json({ error: "Not an admin user" });
      return;
    }
    const passwordMatch = await bcrypt.compare(adminPassword, adminUser.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    const result = await Match.deleteMany({});
    res.status(200).json({ 
      message: "All matches deleted successfully by admin", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a user (admin)
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { adminUsername, adminPassword } = req.body as AdminCredentials;
  const { userId } = req.params;
  if (!adminUsername || !adminPassword) {
    res.status(400).json({ error: "Admin credentials are required" });
    return;
  }
  try {
    const adminUser = await User.findOne({ username: adminUsername });
    if (!adminUser || !adminUser.isAdmin) {
      res.status(403).json({ error: "Not an admin user" });
      return;
    }
    const passwordMatch = await bcrypt.compare(adminPassword, adminUser.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getAllUsers,
  getAllMatches,
  deleteMatch,
  deleteMatches,
  deleteAllMatches,
  deleteUser,
}; 