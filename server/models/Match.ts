import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export type MatchResult = "win" | "loss" | "draw";

export interface IMatch extends Document {
  user: IUser["_id"];
  result: MatchResult;
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  result: { type: String, enum: ["win", "loss", "draw"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMatch>("Match", matchSchema); 