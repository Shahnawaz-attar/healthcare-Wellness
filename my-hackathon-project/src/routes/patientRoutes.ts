// src/routes/patientRoutes.ts

import express from "express";
import Patient from "../models/Patient";
import { UserRole } from "../models/User";

const router = express.Router();

/**
 * @route   POST /api/patient/test
 * @desc    Create a test patient with allergies and current medications
 * @access  Public (for testing purposes)
 */
router.post("/test", async (req, res) => {
  try {
    const { name, email, password, age, allergies, currentMedications } = req.body;

    // Create a new patient using the Patient discriminator.
    const patient = new Patient({
      name,
      email,
      password,
      role: UserRole.PATIENT,
      age,
      allergies,
      currentMedications,
    });

    await patient.save();

    res.status(201).json({ message: "Patient created successfully", patient });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
