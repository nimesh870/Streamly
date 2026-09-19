import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.models.js";
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
        new ApiResponse(201 , "Successfully commented on a video." , comment)
    )

})

const addCommentToTweet = AsyncHandler( async (req , res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id.")
    }

    if (typeof content !== "string" || content?.trim() === "") {
        throw new ApiError(400 , "Comment content is required.")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404 , "No tweet found.")
    }

    const comment = await Comment.create({
        content : content.trim(),
        tweet : tweetId,
        owner : req.user._id
    })

    if (!comment) {
        throw new ApiError(500 , "Error while creating comment.")
    }

    return res.status(201).json(
        new ApiResponse(201 , "Commented successfully on tweet." , comment)
    )

})

const updateComment = AsyncHandler( async (req , res) => {
    const { commentId } = req.params;
    const { newContent } = req.body;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400 , "Invalid comment id.")
    }

    if (typeof newContent !== "string" || newContent?.trim() === "") {
        throw new ApiError(400 , "Comment content is required.")
    }

    const updateComment = await Comment.findOneAndUpdate(
        {
            _id : commentId,
            owner : req.user._id
        },

        {
            $set : {
                content : newContent?.trim()
            }
        },

        {
            returnDocument : "after"
        }
    )

    if (!updateComment) {
        throw new ApiError(500 , "Error while updating comment.")
    }

    return res.status(200).json(
        new ApiResponse(200 , "Comment updated successfully." , updateComment)
    )

})

const deleteComment = AsyncHandler( async (req , res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400 , "Invalid comment id.")
    }

    const deleteComment = await Comment.findOneAndDelete(
        {
            _id : commentId,
            owner : req.user._id
        }
    )

    if (!deleteComment) {
        throw new ApiError(500 , "Error while deleting comment.")
    }

    return res.status(200).json(
        new ApiResponse(200 , "Comment deleted successfully.")
    )
    
})

const getVideoComments = AsyncHandler( async (req , res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400 , "Invalid video id.")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404 , "Video not found.")
    }

    const videoComments = await Comment.aggregate(
        [
            {
                $match : {
                    video : videoId,
                }
            },

            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "ownerDetails"
                }
            },

            {
                $unwind : "$ownerDetails"
            },
        ]
    )

    if (videoComments?.length === 0) {
        return res.status(200).json(
            new ApiResponse(200 , "No comments yet." , [])
        )
    }

    return res.status(200).json(
        new ApiResponse(200 , "Comments fetched successfully." , videoComments)
    )
    
})

const getTweetComment = AsyncHandler( async (req , res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400 , "Invalid tweet id.")    
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404 , "Tweet not found.")
    }

    const tweetComment = await Comment.aggregate(
        [
            {
                $match : {
                    tweet : tweetId
                }
            },

            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "ownerDetails"
                }
            },

            {
                $unwind : "$ownerDetails"
            }
        ]
    )

    if (tweetComment?.length === 0) {
        throw new ApiError(500 , "Error while creating comment.")
    }

    return res.status(200).json(
        new ApiResponse(200 , "Comments fetched successfully." , tweetComment)
    )

})

export {
    addCommentToVideo,
    addCommentToTweet,
    updateComment,
    deleteComment,
    getVideoComments,
    getTweetComment
}