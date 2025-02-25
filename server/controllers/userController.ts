import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcrypt";

interface CreateUserRequest {
  username: string;
  password: string;
  isAdmin?: boolean;
}

interface LoginUserRequest {
  username: string;
  password: string;
}

interface ChangeUsernameRequest {
  userId: string;
  currentPassword: string;
  newUsername: string;
}

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, isAdmin, password } = req.body as CreateUserRequest;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, isAdmin, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error: any) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.username === 1
    ) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as LoginUserRequest;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const changeUsername = async (req: Request, res: Response): Promise<void> => {
  const { userId, currentPassword, newUsername } = req.body as ChangeUsernameRequest;
  if (!userId || !currentPassword || !newUsername) {
    res.status(400).json({ error: "userId, currentPassword and newUsername are required" });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    user.username = newUsername;
    await user.save();
    res.status(200).json({ message: "Username updated successfully", user });
  } catch (error: any) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.username === 1
    ) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createUser, loginUser, changeUsername }; 