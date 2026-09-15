import mongoose from "mongoose";
import { Like } from "../models/likes.models.js";
import { Comment } from "../models/comment.models.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleCommentLike = AsyncHandler( async (req , res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400 , "Invalid comment id.")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404 , "No comment found.")
    }

    const existingLike = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
    })

    if (existingLike) {
        await Like.deleteOne({
            _id : existingLike?._id
        })

        return res.status(200).json(
            new ApiResponse(200 , "Comment unliked successfully.")
        )
    }

    await Like.create({
        comment : commentId,
        likedBy : req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201 , "Comment liked successfully." , null)
    )
})

export {
    toggleCommentLike,
}