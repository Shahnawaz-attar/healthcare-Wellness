import express, { Request, Response as ExpressResponse } from "express";
import { protect, AuthRequest } from "../middlewares/authMiddleware";
import Patient from "../models/Patient";
import Provider from "../models/Provider";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * @route   POST /api/goals
 * @desc    Add a new goal (Only Patients)
 * @access  Private (Patients Only)
 */
router.post(
    "/",
    protect,
    async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
      try {
        if (req.user?.role !== "patient") {
          res.status(403).json({ message: "Only patients can add goals" });
          return;
        }
    
        const { title, targetDate } = req.body;
        if (!title || !targetDate) {
          res.status(400).json({ message: "Title and target date are required" });
          return;
        }
        
        const patient = await Patient.findById(req.user!.id);
        if (!patient) {
          res.status(404).json({ message: "Patient not found" });
          return;
        }
        
        // Do not include _id here—let Mongoose generate it automatically.
        patient.goals.push({
            title,
            targetDate,
            status: "Pending",
            progress: "0%",
            _id: new ObjectId
        });;    
        await patient.save();
    
        res.status(201).json({
          message: "Goal added successfully",
          goals: patient.goals
        });
        return;
      } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
      }
    }
  );

  /**
   * @route   PUT /api/goals/:goalId
   * @desc    Edit a goal (Only Patients)
   * @access  Private (Patients Only)
   */
  router.put(
    "/:goalId",
    protect,
    async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
      try {
        if (req.user?.role !== "patient") {
          res.status(403).json({ message: "Only patients can edit their goals" });
          return;
        }
  
        const { title, targetDate, progress } = req.body;
        const patient = await Patient.findById(req.user!.id);
        if (!patient) {
          res.status(404).json({ message: "Patient not found" });
          return;
        }
  
        // Use Array.find to locate the goal by comparing its _id as a string
        const goal = patient.goals.find(
          (g) => g._id && g._id.toString() === req.params.goalId
        );
        if (!goal) {
          res.status(404).json({ message: "Goal not found" });
          return;
        }
  
        if (title) goal.title = title;
        if (targetDate) goal.targetDate = targetDate;
        if (progress) goal.progress = progress;
  
        await patient.save();
        res.json({ message: "Goal updated successfully", goal });
        return;
      } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
      }
    }
  );
  
  /**
   * @route   GET /api/goals
   * @desc    Get all goals of the logged-in patient
   * @access  Private (Patients Only)
   */
  router.get(
    "/",
    protect,
    async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
      try {
        if (req.user?.role !== "patient") {
          res.status(403).json({ message: "Only patients can view their goals" });
          return;
        }
  
        const patient = await Patient.findById(req.user!.id).select("goals");
        if (!patient) {
          res.status(404).json({ message: "Patient not found" });
          return;
        }
  
        res.json({ goals: patient.goals });
        return;
      } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
      }
    }
  );
  
  /**
   * @route   GET /api/goals/patients
   * @desc    Get goals of all patients assigned to the provider
   * @access  Private (Providers Only)
   */
  router.get(
    "/patients",
    protect,
    async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
      try {
        if (req.user?.role !== "provider") {
          res
            .status(403)
            .json({ message: "Only providers can view patient goals" });
          return;
        }
  
        const provider = await Provider.findById(req.user!.id).populate("patients");
        if (!provider) {
          res.status(404).json({ message: "Provider not found" });
          return;
        }
  
        // Map over the populated patients and extract their goals
        const patientGoals = provider.patients.map((patient: any) => ({
          patientId: patient._id,
          name: patient.name,
          goals: patient.goals || []
        }));
  
        res.json({ patientGoals });
        return;
      } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
      }
    }
  );
  
  /**
   * @route   PUT /api/goals/patient/:patientId/:goalId
   * @desc    Update a patient's goal status (Only Providers)
   * @access  Private (Providers Only)
   */
  router.put(
    "/patient/:patientId/:goalId",
    protect,
    async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
      try {
        if (req.user?.role !== "provider") {
          res
            .status(403)
            .json({ message: "Only providers can update goal status" });
          return;
        }
  
        const { status } = req.body;
        if (!["Pending", "Completed", "Missed"].includes(status)) {
          res.status(400).json({ message: "Invalid status value" });
          return;
        }
  
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
          res.status(404).json({ message: "Patient not found" });
          return;
        }
  
        // Use Array.find to locate the goal
        const goal = patient.goals.find(
          (g) => g._id && g._id.toString() === req.params.goalId
        );
        if (!goal) {
          res.status(404).json({ message: "Goal not found" });
          return;
        }
  
        goal.status = status;
        await patient.save();
        res.json({ message: "Goal status updated successfully", goal });
        return;
      } catch (error: any) {
        res.status(500).json({ error: error.message });
        return;
      }
    }
  );
  
  export default router;
  