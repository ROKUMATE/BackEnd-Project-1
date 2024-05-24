// Whenever Talk with DataBase always use Try/Catch and Async/Await 

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({
    path: './.env'
});

connectDB();



/*
import express from "express";
const app = express();

(async()=>{
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Hello this code is working");
        // app.on("error", ()=>{ 
        //     console.log("Error: ", error)
        //     throw error;
        // });
        // app.listen(process.env.PORT, ()=>{
        //     console.log(`App is listenning at PORT: ${process.env.PORT}`);
        // })
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }
})()
*/
