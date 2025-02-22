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

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Add a new goal
 *     description: Allows a patient to add a new goal.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Goal details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - targetDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: Walk 10,000 steps
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Goal added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 goals:
 *                   type: array
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

  /**
 * @swagger
 * /api/goals/{goalId}:
 *   put:
 *     summary: Edit a goal
 *     description: Allows a patient to edit one of their goals.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The goal ID.
 *     requestBody:
 *       description: Fields to update in the goal.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Walk 12,000 steps
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-15T00:00:00.000Z"
 *               progress:
 *                 type: string
 *                 example: "50%"
 *     responses:
 *       200:
 *         description: Goal updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 goal:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     targetDate:
 *                       type: string
 *                     progress:
 *                       type: string
 *       403:
 *         description: Only patients can edit their goals.
 *       404:
 *         description: Patient or goal not found.
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

  /**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all goals
 *     description: Retrieves all goals of the logged-in patient.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of goals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                       targetDate:
 *                         type: string
 *                       progress:
 *                         type: string
 *       403:
 *         description: Only patients can view their goals.
 *       404:
 *         description: Patient not found.
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


/**
 * @swagger
 * /api/goals/patients:
 *   get:
 *     summary: Get all patient goals for a provider
 *     description: Allows a provider to retrieve the goals of all their assigned patients.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of patient goals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patientGoals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       patientId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       goals:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             title:
 *                               type: string
 *                             status:
 *                               type: string
 *                             targetDate:
 *                               type: string
 *                             progress:
 *                               type: string
 *       403:
 *         description: Only providers can view patient goals.
 *       404:
 *         description: Provider not found.
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

  /**
 * @swagger
 * /api/goals/patient/{patientId}/{goalId}:
 *   put:
 *     summary: Update a patient's goal status
 *     description: Allows a provider to update the status of a patient's goal.
 *     tags:
 *       - Goals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient's ID.
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The goal's ID.
 *     requestBody:
 *       description: New status for the goal.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed, Missed]
 *                 example: Completed
 *     responses:
 *       200:
 *         description: Goal status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 goal:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     targetDate:
 *                       type: string
 *                     progress:
 *                       type: string
 *       400:
 *         description: Invalid status value.
 *       403:
 *         description: Only providers can update goal status.
 *       404:
 *         description: Patient or goal not found.
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
  