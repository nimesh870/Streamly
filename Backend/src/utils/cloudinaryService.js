import { v2 as cloudinary} from "cloudinary";
import fs from "fs";
import "dotenv/config"

const uploadFile = async (localFilePath) => {
    cloudinary.config({
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key : CLOUDINARY_APIKEY,
        api_secret : CLOUDINARY_API_SECRET
    });

    try {
        if (!localFilePath) return null;
        //upload file in cloudinary

       const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        })
        console.log("File uploaded successfully.");
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); // removes the locally saved temp file if upload operation got failed.
        return null
    }
}

export {uploadFile}