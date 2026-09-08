import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { deleteFile, uploadFile } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { Video } from "../models/video.model.js";

// upload video controller
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

// delete video controller
const deleteVideo = AsyncHandler( async(req , res) => {
    const { videoId } = req.params;

    const video = await Video.findOne({
        _id : videoId,
        owner : req.user._id
    })

    if (!video) {
        throw new ApiError(404 , "Video not found.")
    }

    const videoDeleteResult = await deleteFile(video.videoDetails.public_id , "video");
    const thumbnailDeleteResult = await deleteFile(video.thumbnailDetails.public_id);

    if (
        videoDeleteResult?.result !== "ok" ||
        thumbnailDeleteResult?.result !== "ok"
    ) {
        throw new ApiError(500 , "Failed to delete video files from Cloudinary.")
    }

    await Video.deleteOne({_id : video._id});

    return res.status(200).json(
        new ApiResponse(200 , "Video deleted successfully.")
    )
})

// update video controller
const updateVideo = AsyncHandler( async (req , res) => {
    const {newTitle , newDescription} = req.body;
    const { videoId } = req.params;

    const video = await Video.findOne({
        _id : videoId,
        owner : req.user._id
    })

    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    const hasTitleUpdated = typeof newTitle === "String" && newTitle.trim();
    const hasDescriptionUpdated = typeof newDescription === "String" && newDescription.trim();
    const hasThumbnailUpdate = Boolean(req.file?.path);

    if (hasTitleUpdated) {
        video.title = newTitle.trim();
    }

    if (hasDescriptionUpdated) {
        video.description = newDescription.trim();
    }

    let oldThumbnailPublicId = null;
    let newThumbnailPublicId = null;

    if (hasThumbnailUpdate) {
        oldThumbnailPublicId = video.thumbnail?.public_id

        const uploadNewThumbnail = await uploadFile(req.file?.path)

        if (!uploadNewThumbnail) {
            throw new ApiError(500 , "Error while uploading thumbnail.")
        }

        newThumbnailPublicId = uploadNewThumbnail.public_id;

        video.thumbnail = {
            url : uploadNewThumbnail?.secure_url,
            public_id : uploadNewThumbnail.public_id
        }

        try {
            await video.save();
        } catch (error) {
            if (!newThumbnailPublicId) {
                await deleteFile(newThumbnailPublicId, "image");
            }

            throw new ApiError(400 , error.message)
        }

        if (oldThumbnailPublicId) {
            const deleteResult = await deleteFile(oldThumbnailPublicId)

            if (deleteResult.result !== "ok" || deleteResult.result === "not found") {
                throw new ApiError(500 , "Error while deleting thumbnail from cloudinary.")
            }

        }
    }

    return res.status(200).json(
        new ApiResponse(200 , "Video updated successfully.")
    )
})

// fetch video by id
const getVideoById = AsyncHandler( async (req , res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404 , "No video found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , video , "Video fetched successfully.")
    )
})

export {
    publishVideo,
    deleteVideo,
    updateVideo,
    getVideoById
}