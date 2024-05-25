// Whenever Talk with DataBase always use Try/Catch and Async/Await

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

const port = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config({
    path: "./.env",
});

connectDB()
    .then((response) => {
        try {
            app.on("error", () => {
                console.log("Error: ", error);
                throw error;
            });
            app.listen(port, () => {
                console.log(`The Server is running at the Port: ${port}`);
            });
        } catch (err) {
            console.log("There was an error: ", err);
        }
    })
    .catch((error) => {
        console.log(`MONGO DB Connection Failed : `, err);
    });

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
