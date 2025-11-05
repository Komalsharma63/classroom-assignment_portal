import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("⚠️  Missing MONGO_URI environment variable");
    console.log("Please set MONGO_URI in your environment or .env file");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected to:", conn.connection.host);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error("⚠️  MongoDB Connection Error:", error.message);
    if (error.message.includes("bad auth")) {
      console.error("Authentication failed - check your database username and password");
    }
    if (error.message.includes("ENOTFOUND")) {
      console.error("Could not reach MongoDB Atlas - check your network connection and MongoDB URI");
    }
    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("1. Go to MongoDB Atlas (https://cloud.mongodb.com)");
    console.log("2. Select your cluster → Network Access");
    console.log("3. Click 'Add IP Address'");
    console.log("4. Click 'Allow Access from Anywhere' (0.0.0.0/0)");
    console.log("5. Restart the server\n");
    console.log("🔑 Environment Variables Status:");
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`- MONGO_URI: ${process.env.MONGO_URI ? 'set' : 'not set'}`);
    console.log(`- PORT: ${process.env.PORT || 'not set (will use default)'}`);
    process.exit(1);
  }
};

export default connectDB;
