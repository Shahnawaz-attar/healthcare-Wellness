import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI not defined in environment variables.");
    }

    // Connect to MongoDB with the given URI and options.
    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};
