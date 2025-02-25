import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import matchRoutes from "./routes/matchRoutes";
import adminRoutes from "./routes/adminRoutes";
import errorHandler from "./middleware/errorHandler";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin", adminRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/`);
}); 