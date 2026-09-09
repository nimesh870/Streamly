import { v2 as cloudinary} from "cloudinary";
import fs from "fs";
import "dotenv/config"

const uploadFile = async (localFilePath , resource_type = "image") => {
    cloudinary.config({
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key : process.env.CLOUDINARY_APIKEY,
        api_secret : process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!localFilePath) return null;
        
        //upload file in cloudinary
       const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : resource_type
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); // removes the locally saved temp file if upload operation got failed.
        console.log("Cloudinary upload Error:" , error.message)
        return null;
    }
}

const deleteFile = async (publicId , resource_type = "image") => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId , {
            resource_type : resource_type
        })

        return response;

    } catch (error) {
        console.log("Cloudinary deletion Error:",error.message)
        return null;
    }
}

export {
    uploadFile,
    deleteFile
}