import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploading the File on Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // If File Path is not mentioned then directly return null
        if (!localFilePath) return null;

        // Upload the File on Cloudinary
        // Over here there was a bug ... typo ... instead of response i wrote earlier resource
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File Successfully Uploaded
        console.log(
            "File is Succesfully uplaoded on the cloudinary",
            response.url
        );
        fs.unlinkSync(localFilePath);
        // console.log("THE RESPOSE OF CLOUDNINARY IS: ", response);
        // THE RESPOSE OF CLOUDNINARY IS:  {
        //     asset_id: 'fd5d08945f8d4549c2a10afa7bec9af1',
        //     public_id: 'cpdeaockaubtr4nut8pm',
        //     version: 1716755083,
        //     version_id: '98ce15b58535ba7c3eddb918efc4346b',
        //     signature: 'f6736e7a5c2d3e5d1be0fffb747c4f3b87e8b2b4',
        //     width: 1920,
        //     height: 1080,
        //     format: 'png',
        //     resource_type: 'image',
        //     created_at: '2024-05-26T20:24:43Z',
        //     tags: [],
        //     bytes: 4712326,
        //     type: 'upload',
        //     etag: 'f4df7316ec81587c0f9b25e2c6e5797e',
        //     placeholder: false,
        //     url: 'http://res.cloudinary.com/dah8h7uld/image/upload/v1716755083/cpdeaockaubtr4nut8pm.png',
        //     secure_url: 'https://res.cloudinary.com/dah8h7uld/image/upload/v1716755083/cpdeaockaubtr4nut8pm.png',
        //     folder: '',
        //     original_filename: 'Kali linux 1',
        //     api_key: '193323934713672'
        //   }
        return response;
    } catch (err) {
        // Remove the Locally saved temporary file as the Upload operation got failed
        fs.unlinkSync(localFilePath);
        // console.log(err);
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
