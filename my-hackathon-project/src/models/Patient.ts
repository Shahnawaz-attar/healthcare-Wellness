// src/models/Patient.ts

import mongoose, { Schema } from "mongoose";
import User, { IUser, UserRole } from "./User";

// Extend the base IUser interface for Patient-specific properties
export interface IPatient extends IUser {
  age: number;
  allergies: string[];
  currentMedications: string[];
}

// Create a new schema with additional fields for allergies and current medications
const PatientSchema: Schema = new Schema<IPatient>(
  {
    age: { type: Number, default: null },
    allergies: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Use the discriminator to extend the base User model for patients
const Patient = User.discriminator<IPatient>(
  UserRole.PATIENT,
  PatientSchema
);

export default Patient;
