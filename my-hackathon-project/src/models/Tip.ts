// src/models/Tip.ts

import mongoose, { Schema, Document } from "mongoose";

export interface ITip extends Document {
  title: string;
  description: string;
}

const TipSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ITip>("Tip", TipSchema);
