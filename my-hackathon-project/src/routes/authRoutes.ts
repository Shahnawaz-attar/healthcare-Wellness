// src/routes/authRoutes.ts

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';
import Patient from '../models/Patient';
import Provider from '../models/Provider';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (defaults to Patient if no role is provided)
 * @access  Public
 *
 * Mandatory fields:
 * {
 *   "name": "Jane Doe",
 *   "email": "jane.doe@example.com",
 *   "password": "password123"
 * }
 *
 * Optional fields for Patient:
 *   "age": 28,
 *   "allergies": ["peanuts"],
 *   "currentMedications": ["ibuprofen"]
 *
 * Optional fields for Provider (when role is provided as "provider"):
 *   "specialty": "Cardiology"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user (Patient or Provider). If no role is provided, the default is Patient.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: provider
 *               specialty:
 *                 type: string
 *                 example: Cardiology
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 */
router.post('/register', async (req:Request, res:any) => {
  try {
    const {
      name,
      email,
      password,
      role, // Optional field; if not provided, defaults to patient
      age,
      allergies,
      currentMedications,
      specialty,
    } = req.body;

    // Check if user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Default role is Patient if not provided
    const userRole = role ? role : UserRole.PATIENT;
    let newUser: IUser;

    if (userRole === UserRole.PROVIDER) {
      // Create a Provider user (specialty is optional)
      newUser = new Provider({
        name,
        email,
        password,
        role: UserRole.PROVIDER,
        specialty: specialty || '',
      });
    } else {
      // Create a Patient user (age, allergies, and currentMedications are optional)
      newUser = new Patient({
        name,
        email,
        password,
        role: UserRole.PATIENT,
        age: age || 0, // Default age to 0 if not provided
        allergies: allergies || [],
        currentMedications: currentMedications || [],
      });
    }

    // Save the new user to the database
    await newUser.save();

    // Sign a JWT token to return on successful registration
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login an existing user and return a JWT token
 * @access  Public
 *
 * Expected JSON body:
 * {
 *   "email": "jane.doe@example.com",
 *   "password": "password123"
 * }
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     description: Logs in a user and returns a JWT token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req:Request, res:any) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Sign a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
