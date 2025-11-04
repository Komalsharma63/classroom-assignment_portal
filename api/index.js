import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';
import app from '../server/server.js';

// Ensure env is loaded from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

// Connect to DB once per container instance
await connectDB();

export default serverless(app);
