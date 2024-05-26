import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    // Middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "cover-image",
            maxCount: 1,
        },
    ]),
    // Callback
    registerUser
);

export default router;
