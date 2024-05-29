import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    updateUserAvatar,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getUserChannelProfile,
    getWatchHistory,
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
// Change Password
router.route("./changePassword").post(verifyJWT, changeCurrentPassword);
// Get Current User
router.route("./current-user").get(verifyJWT, getCurrentUser);
// Update Account Details
// We Wont Put "POST" method here else every details will be updated in it
router.route("./update-account").patch(verifyJWT, updateAccountDetails);
// Update the user avatar
router.route("/updateAvatar").post(
    verifyJWT,
    // we can also use (M - 1)
    // upload.single("newavatar")
    // M - 2
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
    // we can also use (M - 1)
    // upload.single("newavatar")
    // M - 2
    upload.fields([
        {
            name: "newCoverImage",
            maxCount: 1,
        },
    ]),
    updateUserAvatar
);
// Get User Channel Profile
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
// Get User Watch History
router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;

// http://res.cloudinary.com/dah8h7uld/image/upload/v1716756391/jcullyukra4thbv6c1xb.jpg",
