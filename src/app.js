import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT;

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
// Meaning of extended: true is u can give objects inside objects
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
// Import Routes
import userRouter from "./routers/user.routes.js";

// Routes Declaration
app.use("/api/v1/users", userRouter);

export { app };
