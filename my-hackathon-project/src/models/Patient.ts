import mongoose, { Schema } from "mongoose";
import User, { IUser, UserRole } from "./User";

// Define Goal Schema (without disabling _id)
const GoalSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Missed"], default: "Pending" },
  targetDate: { type: Date, required: true },
  progress: { type: String, default: "0%" }
});

// Extend the base IUser interface for Patients
export interface IPatient extends IUser {
  age: number;
  allergies: string[];
  currentMedications: string[];
  goals: {
    _id: mongoose.Types.ObjectId;
    title: string;
    status: string;
    targetDate: Date;
    progress: string;
  }[];
}

// Define Patient Schema with Goals
const PatientSchema = new Schema<IPatient>(
  {
    age: { type: Number, required: true },
    allergies: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
    goals: { type: [GoalSchema], default: [] }
  },
  { timestamps: true }
);

const Patient = User.discriminator<IPatient>(UserRole.PATIENT, PatientSchema);
export default Patient;
