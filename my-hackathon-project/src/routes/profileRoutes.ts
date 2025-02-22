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
