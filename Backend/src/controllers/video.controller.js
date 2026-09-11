import { Video } from "../models/video.model.js";
import { deleteFile, uploadFile } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js"
import mongoose from "mongoose";

// upload video controller
const publishVideo = AsyncHandler( async (req , res) => {
    const {title , description} = req.body;

    if ([title , description].some((field) => typeof field !== "string" || field?.trim() === "")) {
        throw new ApiError(400 , "You must provide a title and description before uploading the video.")
    }

    const videoPath = req.files.video[0]?.path;
    const thumbnailPath = req.files.thumbnail[0]?.path;

    if ([videoPath , thumbnailPath].some((field) => field?.trim() === "")) {
        throw new ApiError(400 , "Video or thumbnail file is missing.")
    }

    const video = await uploadFile(videoPath , "video");
    const thumbnail = await uploadFile(thumbnailPath , "image");

    if (!video || !thumbnail) {
        throw new ApiError(400 , "Video or thumbnail upload failed.")
    }

    const uploadVideo = await Video.create({
        title : title.trim(),
        description : description.trim(),

        videoDetails : {
            url : video?.secure_url,
            public_id : video?.public_id
        },

        thumbnailDetails : {
            url : thumbnail?.secure_url,
            public_id : thumbnail?.public_id
        },

        duration : video?.duration,
        owner : req.user._id
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

    if (!videoId) {
        throw new ApiError(400 , "No video id found.")
    }

    const video = await Video.findOne({
        _id : videoId,
        owner : req.user._id
    })

    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    const hasTitleUpdated = typeof newTitle === "string" && newTitle.trim();
    const hasDescriptionUpdated = typeof newDescription === "string" && newDescription.trim();
    const hasThumbnailUpdate = Boolean(req.file?.path);

    if (hasTitleUpdated) {
        video.title = newTitle.trim();
        await video.save()
    }

    if (hasDescriptionUpdated) {
        video.description = newDescription.trim();
        await video.save()
    }

    let oldThumbnailPublicId = null;
    let newThumbnailPublicId = null;

    if (hasThumbnailUpdate) {
        oldThumbnailPublicId = video.thumbnailDetails?.public_id

        const uploadNewThumbnail = await uploadFile(req.file?.path ,"image")

        if (!uploadNewThumbnail) {
            throw new ApiError(500 , "Error while uploading thumbnail.")
        }

        newThumbnailPublicId = uploadNewThumbnail.public_id;

        video.thumbnailDetails = {
            url : uploadNewThumbnail?.secure_url,
            public_id : uploadNewThumbnail?.public_id
        }

        try {
            await video.save();
        } catch (error) {
            if (newThumbnailPublicId) {
                await deleteFile(newThumbnailPublicId, "image");
            }

            throw new ApiError(400 , error.message)
        }

        if (oldThumbnailPublicId) {
            const deleteResult = await deleteFile(oldThumbnailPublicId , "image")

            if (deleteResult.result !== "ok" || deleteResult.result === "not found") {
                throw new ApiError(500 , `Error while deleting thumbnail from cloudinary. Delete result : ${deleteResult.result}`)
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

    if (!videoId) {
        throw new ApiError(400 , "No video id found.")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404 , "No video found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , video , "Video fetched successfully.")
    )
})

// fetch all videos
const getAllVideos = AsyncHandler( async (req , res) => {
    const {userId , page=1 , limit=20 , sortBy = "createdAt" , sortType = "newest"} = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (pageNumber < 1 || !Number.isInteger(pageNumber)) {
        throw new ApiError(400 , "Page number must be a positive integer.")
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        throw new ApiError(400 , "Limit must be between 1 and 100 as a positive integer.")
    }

    const allowedSortFields = [
        "createdAt",
        "views",
        "title"
    ]

    if(!allowedSortFields.includes(sortBy)) {
        throw new ApiError(400 , "Invalid sort field.")
    }

    const allowedSortTypes = ["newest" , "oldest"];

    if (!allowedSortTypes.includes(sortType)) {
        throw new ApiError(400 , "Invalid sort type.")
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400 , "Invalid user id.")
    }

    const skipPage = (pageNumber - 1) * limitNumber;
    const sortField = sortBy || "createdAt";
    const sortOrder = sortType === "oldest" ? 1 : -1;

    const filter = {};

    if (userId) {
        filter.owner = userId
    }

    const videos = await Video.find(filter).sort({[sortField] : sortOrder , _id : sortOrder}).skip(skipPage).limit(limitNumber)

    if (!videos) {
        throw new ApiError(404 , "No vidoes found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , videos , "All vidoes fetched.")
    )
})

// toggle published
const togglePublished = AsyncHandler( async (req , res) => {
    const { videoId } = req.params;
    
    if (!videoId) {
        throw new ApiError(400 , "Video Id is required.")
    }

    const video = await Video.findOne({
        _id : videoId,
        owner : req.user._id
    })

    if (!video) {
        throw new ApiError(404 , "No video found from database.")
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200 , {isPublished : video.isPublished} , "Publish status updated.")
    )
})

export {
    publishVideo,
    deleteVideo,
    updateVideo,
    getVideoById,
    getAllVideos,
    togglePublished
}