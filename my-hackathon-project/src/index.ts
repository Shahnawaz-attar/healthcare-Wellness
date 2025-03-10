// src/server.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/dbConfig";
import authRoutes from "./routes/authRoutes";
import patientRoutes from "./routes/patientRoutes";
import profileRoutes from './routes/profileRoutes';
import goalRoutes from "./routes/goalRoutes";
import tipRoutes from "./routes/tipRoutes";  // <-- Import tip routes

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


// Import Swagger tools

// import swaggerUi from "swagger-ui-express";

import swaggerOptions from "./config/swaggerConfig";



dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/tips", tipRoutes);  // <-- Mount tip routes


// Set up Swagger docs
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
