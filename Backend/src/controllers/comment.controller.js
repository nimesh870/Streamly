import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import mongoose from "mongoose";

const addCommentToVideo = AsyncHandler( async (req , res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (typeof content !== "string" || content?.trim() === "") {
        throw new ApiError(400 , "Comment content is required.")
    }

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400 , "Invalid video id.")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404 , "Video not found.")
    }

    const comment = await Comment.create({
        content : content.trim(),
        video : videoId,
        owner : req.user._id
    })

    if (!comment) {
        throw new ApiError(500 , "Error while creating comment.")
    }

    return res.status(201).json(
        new ApiResponse(201 , comment , "Successfully commented on a video.")
    )

})


export {
    addCommentToVideo
}