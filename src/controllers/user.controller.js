import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
