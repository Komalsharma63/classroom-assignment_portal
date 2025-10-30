import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("⚠️  MongoDB Connection Error:", error.message);
    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("1. Go to MongoDB Atlas (https://cloud.mongodb.com)");
    console.log("2. Select your cluster → Network Access");
    console.log("3. Click 'Add IP Address'");
    console.log("4. Click 'Allow Access from Anywhere' (0.0.0.0/0)");
    console.log("5. Restart the server\n");
    process.exit(1);
  }
};

export default connectDB;
