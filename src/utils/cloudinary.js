import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

// Uploading the File on Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // If File Path is not mentioned then directly return null
        if (!localFilePath) return null;

        // Upload the File on Cloudinary
        const resource = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File Successfully Uploaded
        console.log(
            "File is Succesfully uplaoded on the cloudinary",
            response.url
        );
        return response;
    } catch (err) {
        // Remove the Locally saved temporary file as the Upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };

// (async function () {
//     // Configuration
//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
//     });

//     // Upload an image
//     const uploadResult = await cloudinary.uploader
//         .upload(
//             "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//             {
//                 public_id: "shoes",
//             }
//         )
//         .catch((error) => {
//             console.log(error);
//         });

//     console.log(uploadResult);

//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url("shoes", {
//         fetch_format: "auto",
//         quality: "auto",
//     });

//     console.log(optimizeUrl);

//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url("shoes", {
//         crop: "auto",
//         gravity: "auto",
//         width: 500,
//         height: 500,
//     });

//     console.log(autoCropUrl);
// })();
