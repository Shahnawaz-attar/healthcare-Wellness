// src/routes/profileRoutes.ts

import express, { Request, Response } from 'express';
import User from '../models/User';
import { protect, AuthRequest } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get the authenticated user's profile (excluding password)
 * @access  Private
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get profile by ID
 *     description: Retrieves a user's profile by their ID.
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: The user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: User not found
 */
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find user by ID attached in req.user (decoded from JWT)
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update the authenticated user's profile
 * @access  Private
 *
 * For Patients, allowed fields might include: name, age, allergies, currentMedications.
 * For Providers, allowed fields might include: name, specialty.
 */


/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update the user's profile
 *     description: Updates the authenticated user's profile with the provided data and returns the updated profile.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: The profile fields to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.put('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Update the user's profile with the fields provided in req.body.
    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
