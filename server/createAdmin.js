import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@classroom.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists:");
      console.log("   Email: admin@classroom.com");
      console.log("   Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@classroom.com",
      passwordHash,
      role: "admin"
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@classroom.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role:     admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
