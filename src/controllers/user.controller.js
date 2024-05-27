import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Function to Generate the Access and Refresh Tokens
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
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

export { registerUser, loginUser, logoutUser };
