// src/routes/tipRoutes.ts

import express, { Response as ExpressResponse } from "express";
import { protect, AuthRequest } from "../middlewares/authMiddleware";
import Tip from "../models/Tip";

const router = express.Router();

/**
 * @swagger
 * /api/tips:
 *   get:
 *     summary: Get a random tip for the patient
 *     description: Returns a random tip from the database for the logged-in patient.
 *     tags:
 *       - Tips
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A random tip for the patient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tip:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       403:
 *         description: Only patients can view tips.
 *       404:
 *         description: No tips found.
 *       500:
 *         description: Server error.
 */
router.get(
  "/",
  protect,
  async (req: AuthRequest, res: ExpressResponse): Promise<void> => {
    try {
      // Optionally restrict tips to patients.
      if (req.user?.role !== "patient") {
        res.status(403).json({ message: "Only patients can view tips" });
        return;
      }
      // Use aggregation to pick one random tip.
      const tips = await Tip.aggregate([{ $sample: { size: 1 } }]);
      console.log(tips,'tips')
      if (!tips || tips.length === 0) {
        res.status(404).json({ message: "No tips found" });
        return;
      }
      res.json({ tip: tips[0] });
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
);

export default router;
