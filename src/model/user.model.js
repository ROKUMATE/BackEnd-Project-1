import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Mongodb store the data in bson data and not in the json data for the ID Field on its own

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // Cloudinary URL
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        password: {
            type: String,
            password: [true, "Password is require"],
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

// dcrypt Lib Use
// This is for saving the password in the Encrypted form and not in the plain text form in the database!
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // bcrypt.hash("WHAT TO HASH", "HOW MANY ROUNDS TO HASH")
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } else {
        return next();
    }
});

// For checking if the User have entered a correct password or not
userSchema.methods.isPasswordCorrect = async function (password) {
    // bcrypt.compare("String", "Encrypted password"); {This Returns true or false}
    return await bcrypt.compare(password, this.password);
};

// JWT Lib Use
// Generating the Access token (in Access token we have more info)
userSchema.methods.generateAccessToken = async function () {
    jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generating the Refresh token (In refresh token we have less info in it)
userSchema.methods.generateRefreshToken = async function () {
    jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
