import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/demo'


export default async function dbConnect() {
    try {
        const client = await connect(mongoUri);

        if (client) {
            console.log("Database Connected Successfully");
            // Safely drop stale legacy index if present
            try {
                const db = client.connection.db;
                if (db) {
                    await db.collection("users").dropIndex("licenseNumber_1").catch(() => {});
                }
            } catch (err) {
                // Ignore if collection or index doesn't exist
            }
        }

    } catch (error) {
        console.log("Database connection failed:", error.message);
        throw error;
    }
}