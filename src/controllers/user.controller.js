import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
    extractPublicIdFromUrlOfCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from "jsonwebtoken";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Function to Generate the Access and Refresh Tokens
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); // the user is the reference to the userID Database one
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        // console.log(
        //     "\\\\ \\\\ \\\\ \\\\ After Generating the access and the Refresh tokens \\\\ \\\\ \\\\ \\\\ ",
        //     user
        // );
        // This will tell that not to check the other required fields
        await user.save({ validateBeforeSave: false });
        // console.log(`${accessToken} "This is the Access Token"`);

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(
            500,
            "Something Went wrong while sending the access and referesh tokens back"
        );
    }
};

// Controller for Registering the User
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({ message: "Server is starting" });
    /* 
    Actual Steps = {
        1. Get details from the user
        2. Validations -> If few strings are empty or not 
        3. Check if the user already exists or not { Check either by username or name }
        4. Check for images, Check for avatar
        5. Upload them to Cloudinary,  avatar
        6. Create User Object - Create Entry in Db  
        7. Remove password and refresh token field from the response
        8. Check for user Creation 
        9. Return Response
    }
    */

    const { fullName, email, username, password } = req.body;
    // console.log(req.body);

    // 2. Validations -> If few strings are empty or not
    /*
    Beigneer Method
    if(fullName === ""){
        throw new ApiError(400, "FullName Is Required")
    }
    */
    // Professional Method (We make another valadiation file here)
    if (
        // New Some Method
        [fullName, email, username, password].some(
            (field) => field?.trim === ""
        )
    ) {
        throw new ApiError(400, "All Fields are Compulsory");
    }

    // 3. Check if the user already exists or not { Check either by username or name }
    const ExistedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (ExistedUser) {
        throw new ApiError(
            409,
            "Another User with same Creditianls already exists"
        );
    }

    // Additional Point (req.files)
    // console.log(req.files);
    // [Object: null prototype] {
    //     avatar: [
    //       {
    //         fieldname: 'avatar',
    //         originalname: 'Quantom Atom 3.jpg',
    //         encoding: '7bit',
    //         mimetype: 'image/jpeg',
    //         destination: './public/temp',
    //         filename: 'Quantom Atom 3.jpg',
    //         path: 'public/temp/Quantom Atom 3.jpg',
    //         size: 659405
    //       }
    //     ],
    //     coverImage: [
    //       {
    //         fieldname: 'coverImage',
    //         originalname: 'Kali linux 1.png',
    //         encoding: '7bit',
    //         mimetype: 'image/png',
    //         destination: './public/temp',
    //         filename: 'Kali linux 1.png',
    //         path: 'public/temp/Kali linux 1.png',
    //         size: 4712326
    //       }
    //     ]
    //   }

    // 4. Check for images, Check for avatar
    // console.log(req.files.avatar);
    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // This might be wrong
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    // 5. Upload them to Cloudinary,  avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // 5.1 Check if avatar is there or not
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 6. Create User Object - Create Entry in Db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        // username: username.toLowerCase(),
        username: username.toLowerCase(),
    });

    // Add.Pt. Check if the user is created or not
    // const createdUser = await User.findById(user._id)

    // 7. Remove password and refresh token field from the response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // 8. Check for user Creation
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something Went Wrong => User havent been created"
        );
    }

    // 9. Return Response
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User Registered! Successfully")
        );
});

// Controller for Login of the Registered User
const loginUser = asyncHandler(async (req, res) => {
    // All Steps
    /*
    1. req.body -> data
    2. username / email based access
    3. find the user 
    4. password check
    5. access and refresh token generation
    6. send in secure cookie the refresh and access token
    */

    //    1. req.body -> data
    const { email, username, password } = req.body;
    // We Want both username and email
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // Here is an Alternative for that if we want either of username or email
    // if (!(username || email)) {
    //     throw new ApiError(400, "Username or email is required");
    // }

    //    2. username / email based access
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    //    3. find the user
    if (!user) {
        throw new ApiError(404, "User does not exist)");
    }

    //    4. password check
    // Note one thing The "User" is a mongoDB object not an local object ... The "user" is the local object that we fetched from the mongodb
    const passwordCheck = await user.isPasswordCorrect(password);
    if (!passwordCheck) {
        throw new ApiError(401, "Invalid User Credentials");
    }

    //    5. access and refresh token generation
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );
    // Checking Purpose
    // console.log(
    //     "\\\\ \\\\ \\\\ \\\\ After the Function of Generating the access and the Refresh tokens \\\\ \\\\ \\\\ \\\\ ",
    //     user
    // );

    //    6. send in secure cookie the refresh and access token
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        // The Above two lines means the cookies are modified by only the server
    };

    // console.log(`${user.username} user Logged in`);
    // console.log(`${accessToken} user access Tokens`);
    // console.log(`${refreshToken} user refresh Tokens`);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged in Successfully"
            )
        );
});

// Controller For Logout of an user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        // $ sign means mongodb operators
        $set: {
            refreshToken: undefined,
        },
    });

    const options = {
        httpOnly: true,
        secure: true,
        // The Above two lines means the cookies are modified by only the server
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"));
    // .jsonResponse(200, {}, "User Logged Out");
});

// When the Users access token expire then then frontend will hit this method to refresht he users access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // 1. Getting the Refresh token from the cookie or the body
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    // 2. If Incoming refresh Token dont exist (Then the user is asking for the unauthorized acess)
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        // then get the original database _if from the refreshToken
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Check for the database entry of the user in the database with the given id
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Unauthorized Request");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            // console.log("Something");
            throw new ApiError(401, "Refresh Token is Expired Or Used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessAndRefereshTokens(user._id);
        return (
            res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                // mistake was over here in the syntax (Previously it was ApiResponse( ... ) and not it is json (new ApiResponse( ... ))
                .json(
                    new ApiResponse(
                        200,
                        {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        },
                        "Cookie Recreated"
                    )
                )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token");
    }
});

// Changing the users Current Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    // Getting the New Password from the user
    const { oldPassword, newPassword, confPassword } = req.body;

    // if (newPassword !== confPassword) {
    //     throw new ApiError(
    //         401,
    //         "The New Password and the Confirm Password are not same"
    //     );
    // }

    const user = await User.findById(req.user?._id);

    if (await !user.isPasswordCorrect(oldPassword)) {
        throw new ApiError(400, "Your entered Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Sent Successfully"));
});

// Getting the Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current User Fetched Successfully")
        );
});

// Update the account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All Fields Are Required");
    }

    // new: true => {update hone kee badd joo info hae whoo return hote hae}
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                // We can even Write "fullName" only
                fullName: fullName,
                email: email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Accoutn Details updated successfully")
        );
});

// Updating the files
// while updating the files remember we need to add to middlewares the "Multer" one and the second "verify middleware"
// Avatar Updaate
const updateUserAvatar = asyncHandler(async (req, res) => {
    // console.log(req.files?.newAvatar[0]);
    const avatarLocalPath = req.files?.newAvatar[0].path;
    // console.log(req.user);
    // console.log("req.user.avatar : ", req.user.avatar);
    const publicIdOfOldAvatar = extractPublicIdFromUrlOfCloudinary(
        req.user.avatar
    );
    // // console.log(publicIdOfOldAvatar);
    // const oldAvatarCloudinaryPublicId = req.user.avatar.public_id;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // console.log("Avatar awaited from uploadOnCloudinary: ", avatar);
    // Avatar Object: {
    //     asset_id: '937b388b14932e3b2192cc6d465d6cd5',
    //     public_id: 'uppd7cxcwyfciauerycf',
    //     version: 1716894010,
    //     version_id: '421004de269b9ed64e5c137ba8beb2bf',
    //     signature: '1759f40476d619fcf03d057f9f66bc71256370f0',
    //     width: 380,
    //     height: 234,
    //     format: 'jpg',
    //     resource_type: 'image',
    //     created_at: '2024-05-28T11:00:10Z',
    //     tags: [],
    //     bytes: 32758,
    //     type: 'upload',
    //     etag: '569c243e654afb6da85248af4d040e84',
    //     placeholder: false,
    //     url: 'http://res.cloudinary.com/dah8h7uld/image/upload/v1716894010/uppd7cxcwyfciauerycf.jpg',
    //     secure_url: 'https://res.cloudinary.com/dah8h7uld/image/upload/v1716894010/uppd7cxcwyfciauerycf.jpg',
    //     folder: '',
    //     original_filename: 'coverImage',
    //     api_key: '193323934713672'
    //   }
    if (!avatar.url) {
        throw new ApiError(400, "Error while Uploading the Avatar");
    }

    // Update in the user // Method 1 //
    // const user = User.findById(req.user._id);
    // user.avatar = avatar;
    // user.save({ validateBeforeSave: false });

    // Update in the user // Method 2 // Changing the avatar image old url to the new url // Correct
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                avatar: avatar.url,
            },
            { new: true }
        ).select("-password");
    } catch (error) {
        throw new ApiError(
            500,
            "there was a server problem in replacing the avatar url with the new one"
        );
    }

    // Deleting the previous avatar image url from the cloudinary
    deleteFromCloudinary(publicIdOfOldAvatar);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "The update of the Avatar of the user was successful"
            )
        );
});
// CoverImageUpdate
const updateUserCoverImage = asyncHandler(async (req, res) => {
    // Same As that of the avatar so deleted all the comments

    const coverImageLocalPath = req.files?.newCoverImage[0].path;
    const publicIdOfOldCoverImage = extractPublicIdFromUrlOfCloudinary(
        req.user.coverImage
    );

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage File is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while Uploading the coverImage");
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                coverImage: coverImage.url,
            },
            { new: true }
        ).select("-password");
    } catch (error) {
        throw new ApiError(
            500,
            "there was a server problem in replacing the coverImage url with the new one"
        );
    }

    deleteFromCloudinary(publicIdOfOldCoverImage);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "The update of the CoverImage of the user was successful"
            )
        );
});

// Get the visited Channel Profile Information
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is missing");
    }
    // // First Method
    // User.find({username})

    // Second Method // MongoDB aggregration Pipeline
    const channel = await User.aggregate([
        // Finding the channel username in the User data base [using the $match operator
        {
            // Got all the Channel(user) Details
            // [And hence adding more field regarding the total subscribers, total channels subscribed to also is we the user is subscribed to that channel or not]
            $match: {
                username: username?.toLowerCase,
            },
        },
        // Now add a field of subscribers which is a array of all the users who have subscribed him / her using the $lookup operator
        {
            $lookup: {
                // Here when we are searching from the mongoose we have to give the name of the database name which is stored in mongodb
                // As its stored in lower case letters and as a pural form
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        // Now add a field subscribedTo as an array of all chanels that he / her have subscribed using the $lookup operator
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        // Now add all the field to it like subscribersCount, channelsSubscribedToCount using the $addFields operator
        {
            $addFields: {
                subscribersCount: {
                    $size: "subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "subscribedTo",
                },
                // To what to show on the channel page if we are subscribed to that channel or not?
                isSubscribed: {
                    $cond: {
                        if: {
                            // req.user is us
                            // Where as we are viewing the page of another channel (user only)
                            // So we will check if our is there or not in their subscribers list / array

                            // The $in see inside the array also and object also
                            $in: [req.user?._id, "$subscribers.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        // Now just display the field u want to display to the user using the $project operator
        {
            $project: {
                username: 1,
                fullName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    // console.log(channel);
    // what Data type does aggregate pipleline returns
    // An Array with different object values in it
    // We have don ematch so we will Get only one value in that array

    if (!channel?.length) {
        throw new ApiError(404, "Channel Dosnt Exists");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            // aggregration pipleline return an array ---> we have to here remove the first value and give it
            channel[0],
            "User Channel Fetched Successfully "
        )
    );
});

// Get User Watch History
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // If we Directly wrote here req.user._id then it will return a string while of ObjectId:'...' as we are inside mongodb Aggregration pipeline
                // So to convert it using mongoose
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // Nested Lookup
                pipeline: [
                    // now we are in videos
                    // and adding this pipeline to the watchHistory
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            // now this whole user data that we want will go inside the owner field only
                            // And adding this pipeline to the owner
                            pipeline: [
                                {
                                    // Now we are in owner
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    // Now we have dont a look up so the data is stored in an array and we need the first element of that array
                    {
                        // This will update the array value of the field to the object
                        $addFields: {
                            owner: {
                                $first: "owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    if (!user) {
        throw new ApiError(404, "Users WatchHistory not Created!");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            // aggregration pipleline return an array ---> we have to here remove the first value and give it
            user[0].watchHistory,
            "The Users Watch History Has been Fetched Successfully!"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
