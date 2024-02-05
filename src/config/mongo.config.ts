// mongo.config.ts
import mongoose from "mongoose";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const connectionUri = "mongodb://localhost:27017/classified";
    await mongoose.connect(connectionUri, undefined);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
