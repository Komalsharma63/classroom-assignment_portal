import mongoose from "mongoose";

/**
 * Connection caching for serverless environments.
 * Keeps a reference on the global object to avoid creating
 * new connections on each lambda/function invocation.
 */
const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected:", cached.conn.host || cached.conn.name);
    return cached.conn;
  } catch (error) {
    console.error("⚠️  MongoDB Connection Error:", error.message);
    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("1. Go to MongoDB Atlas (https://cloud.mongodb.com)");
    console.log("2. Select your cluster → Network Access");
    console.log("3. Click 'Add IP Address'");
    console.log("4. Click 'Allow Access from Anywhere' (0.0.0.0/0)");
    console.log("5. Restart the server\n");
    throw error;
  }
};

export default connectDB;
