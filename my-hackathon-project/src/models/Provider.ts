// src/models/Provider.ts

import mongoose, { Schema } from "mongoose";
import User, { IUser, UserRole } from "./User";

// Define Provider Interface
export interface IProvider extends IUser {
  specialty?: string;
  patients: mongoose.Types.ObjectId[];
}

// Define Schema for Provider with an optional specialty field
const ProviderSchema: Schema = new Schema<IProvider>(
  {
    specialty: { type: String, default: '' }, // Now optional
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Use base User model and add new fields via discriminator
const Provider = User.discriminator<IProvider>(
  UserRole.PROVIDER,
  ProviderSchema
);

export default Provider;
