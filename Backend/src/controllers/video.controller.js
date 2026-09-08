import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadFile } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { Video } from "../models/video.model.js";

const publishVideo = AsyncHandler( async (req , res) => {
    const {title , description} = req.body;

    if ([title , description].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "You must provide a title and description before uploading the video.")
    }

    const videoPath = req.files.video[0]?.path;
    const thumbnailPath = req.files.thumbnail[0]?.path;

    if ([videoPath , thumbnailPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "Video or thumbnail file is missing.")
    }

    const video = await uploadFile(videoPath);
    const thumbnail = await uploadFile(thumbnailPath)

    if (!video || !thumbnail) {
        throw new ApiError(400 , "Video or thumbnail upload failed.")
    }

    const uploadVideo = await Video.create({
        title,
        description,

        videoDetails : {
            url : video?.secure_url,
            public_id : video?.public_id
        },

        thumbnailDetails : {
            url : thumbnail?.secure_url,
            public_id : thumbnail?.public_id
        },

        duration : video?.duration
    })

    return res.status(200).json(
        new ApiResponse(200 , uploadVideo , "Video uploaded successfully.")
    )

})

export {
    publishVideo,
}