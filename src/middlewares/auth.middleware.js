import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Getting the token from the req {the mobile users cant send the req.cookies soo we there use the authorization part}
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        // Checking if there is a token or not
        if (!token) {
            throw new ApiError(401, "Unauthorised Access");
        }

        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

        // Find the user in the database
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        // What if we dont get the user
        if (!user) {
            // Discuss Abt frontend.
            throw new ApiError(401, "Invalid Access Token");
        }

        // Add a New Object to the req named User
        req.user = user;

        // Go to the Next middleware
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

export { verifyJWT };
