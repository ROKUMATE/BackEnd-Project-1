import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// import dotenv from "dotenv";

// // Load environment variables from .env file
// dotenv.config();


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`);

    } catch (err) {
        console.log("MongoDB Connection Error", err);
        process.exit(1);
    }
};


export default connectDB
