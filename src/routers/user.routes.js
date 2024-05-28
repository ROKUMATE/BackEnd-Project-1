import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    updateUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create a new User
router.route("/register").post(
    // Middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    // Callback
    registerUser
);
// For Login of the user
router.route("/login").post(loginUser);
// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
// For Refreshing the access token
router.route("/refreshToken").post(refreshAccessToken);
// Update the user avatar
router.route("/updateAvatar").post(
    verifyJWT,
    upload.fields([
        {
            name: "newAvatar",
            maxCount: 1,
        },
    ]),
    updateUserAvatar
);
// Update the user coverImage
router.route("/updateCoverImage").post(
    verifyJWT,
    upload.fields([
        {
            name: "newCoverImage",
            maxCount: 1,
        },
    ]),
    updateUserAvatar
);

export default router;

// http://res.cloudinary.com/dah8h7uld/image/upload/v1716756391/jcullyukra4thbv6c1xb.jpg",
